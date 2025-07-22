import sql from '../database/connection.js';
import { authenticateToken, requireAuth, requirePremium } from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import express from 'express';
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, ' ');
}

function keywordMatch(company, keywords) {
  const name = normalize(company.company_name);
  const sector = normalize(company.industry_sector);
  return keywords.some(k => name.includes(k) || sector.includes(k));
}

router.post('/chat', authenticateToken, requireAuth, requirePremium, async (req, res) => {
  console.log('--- /api/crisis/chat route hit ---');
  try {
    const { message } = req.body;
    console.log('[POST /api/crisis/chat] Incoming message:', message);

    // Get company data
    console.log('Before company data await');
    const companies = await sql`
      SELECT company_name, industry_sector, crisis_score, crisis_category, primary_crisis_signals
      FROM crisis_companies
    `;
    console.log('After company data await, companies:', companies.length);

    // Filtering logic
    let filtered = [];
    if (message && typeof message === 'string') {
      // Split message into keywords (words longer than 2 chars)
      const keywords = message
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(w => w.length > 2);
      // 1. Try direct/partial match on company name
      filtered = companies.filter(c => {
        const name = normalize(c.company_name);
        return keywords.some(k => name.includes(k));
      });
      // 2. If none, try keyword match on industry sector
      if (filtered.length === 0) {
        filtered = companies.filter(c => keywordMatch(c, keywords));
      }
    }
    // 3. If still none, send a random sample of 5
    if (filtered.length === 0) {
      filtered = companies.slice(0, 5);
    }

    // AI prompt
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `SYSTEM: You are Kairos, a professional business intelligence consultant specializing in Philippine companies. You have a warm, helpful personality - like a trusted advisor who's genuinely excited to help. You're professional but approachable, knowledgeable but not overwhelming.

IMPORTANT RULES:
- Be professional but warm and helpful
- Keep responses concise and clear
- Don't give detailed analysis unless specifically asked
- Use a friendly, consultant-like tone
- Show genuine interest in helping the user
- Ask thoughtful follow-up questions
- Only give recommendations if the user specifically asks for them
- Be enthusiastic about sharing insights, but not pushy
- DON'T reintroduce yourself in every response - be natural and conversational
- If the user is continuing a conversation, respond naturally without formal greetings
- Only introduce yourself on the first greeting, then be conversational

Here's the company data you're analyzing:\n${JSON.stringify(filtered, null, 2)}\n\nUser question: ${message}\n\nRespond naturally as Kairos. If this is the first greeting, introduce yourself warmly. If it's a continuing conversation, respond directly without reintroducing yourself. Be helpful and enthusiastic, but professional.`;

    let aiText = '';
    let result = null;
    try {
      console.log('Before AI generateContent await');
      result = await model.generateContent(prompt);
      console.log('After AI generateContent await');
      if (result && result.response && typeof result.response.text === 'function') {
        aiText = result.response.text();
      }
    } catch (aiError) {
      console.error('[POST /api/crisis/chat] AI error:', aiError);
    }

    if (!aiText) {
      console.error('[POST /api/crisis/chat] AI did not return a valid response:', result);
      return res.status(500).json({ success: false, error: 'AI did not return a valid response' });
    }
    console.log('[POST /api/crisis/chat] AI response:', aiText);
    return res.json({ success: true, ai_response: aiText });

  } catch (error) {
    console.error('[POST /api/crisis/chat] Chat route error:', error);
    // Always send JSON, never let it send empty response
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router; 