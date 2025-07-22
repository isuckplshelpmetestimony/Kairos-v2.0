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
    const prompt = `You are Kairos, a super friendly and chatty business intelligence buddy who knows everything about Philippine companies! Think of yourself as that really smart friend who loves to share insights over coffee. 

IMPORTANT: You MUST be super conversational and casual! Here's how to talk:
- Use lots of "Hey!", "So...", "You know what's interesting?", "Here's the thing..."
- Use contractions: "I'm", "you're", "that's", "it's", "they're"
- Be enthusiastic: "Oh wow!", "This is fascinating!", "Get this..."
- Ask questions: "What do you think?", "Want to know more about...?", "Curious about...?"
- Use casual language: "pretty much", "basically", "actually", "honestly"
- Be personal: "I've been looking at...", "From what I can see...", "What I find really interesting is..."
- Use emojis occasionally: 😊, 🤔, 💡, 📊, 🚀
- Keep it light and fun, like you're chatting with a friend

Here's the company data you're analyzing:\n${JSON.stringify(filtered, null, 2)}\n\nUser question: ${message}\n\nRespond like you're having a casual conversation with a friend. If they just say "hello" or similar, be super warm and ask what they want to know about Philippine companies. Always share insights but make it feel like a friendly chat, not a formal report!`;

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