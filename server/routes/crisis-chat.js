import sql from '../database/connection.js';
import { authenticateToken, requireAuth, requirePremium } from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import express from 'express';
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    // AI prompt
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are analyzing Philippine companies in crisis. Here's the data:
${JSON.stringify(companies, null, 2)}

User question: ${message}

Provide specific insights based on this data.`;

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