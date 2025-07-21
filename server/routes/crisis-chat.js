import sql from '../database/connection.js';
import { requireAuth, requirePremium } from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import express from 'express';
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', requireAuth, requirePremium, async (req, res) => {
  try {
    const { message } = req.body;

    // Get company data
    const companies = await sql(`
      SELECT company_name, industry_sector, crisis_score, crisis_category, primary_crisis_signals
      FROM crisis_companies WHERE is_active = true
    `);

    // AI prompt
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `You are analyzing Philippine companies in crisis. Here's the data:
${JSON.stringify(companies, null, 2)}

User question: ${message}

Provide specific insights based on this data.`;

    const result = await model.generateContent(prompt);
    let aiText = '';
    if (result && result.response && typeof result.response.text === 'function') {
      aiText = result.response.text();
    }
    if (!aiText) {
      console.error('AI did not return a valid response:', result);
      return res.status(500).json({ error: 'AI did not return a valid response' });
    }
    console.log('AI response:', aiText);
    res.json({ ai_response: aiText });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router; 