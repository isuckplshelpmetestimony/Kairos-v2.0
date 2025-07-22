delete require.cache[require.resolve('../database/connection')];
const connection = require('../database/connection');
const sql = connection.sql || connection;
const { authenticateToken, requireAuth, requirePremium } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', authenticateToken, requireAuth, requirePremium, async (req, res) => {
  console.log('req.user in chat:', req.user);
  try {
    const { message, session_id } = req.body;
    const userId = req.user.id;
    const sessionId = session_id || `session_${Date.now()}`;

    console.log(`Enhanced chat request from user ${userId}: ${message}`);

    // Step 1: Analyze intent and decide if we need web scraping
    // Web scraping logic removed

    // Step 2: Get company context
    // Web scraping logic removed

    let webData = [];
    // Web scraping logic removed

    // Step 4: Optimize context for free Gemini (legacy ContextOptimizer removed)
    const optimizedContext = {}; // Placeholder, since ContextOptimizer is removed

    // Step 5: Generate response with enhanced prompting
    const enhancedPrompt = message;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent(enhancedPrompt);
    const aiResponse = result.response.text();

    // Step 6: Generate follow-up suggestions
    const followups = [];
    await router.saveChatConversation(userId, message, aiResponse, sessionId);

    res.json({
      ai_response: aiResponse,
      response_time_ms: Date.now() - (req.startTime || Date.now()),
      suggested_followups: followups,
      sources_used: [],
      session_id: sessionId
    });
  } catch (error) {
    console.error('Enhanced chat error:', error);
    res.status(500).json({ error: 'I encountered an error processing your request. Please try again.' });
  }
});

// Helper methods
router.shouldScrapeWeb = (message) => {
  const webIndicators = [
    /latest|recent|current|today|this month|news/i,
    /market trends|industry update|competitive landscape/i,
    /what.*happening|current.*situation/i
  ];

  return webIndicators.some(pattern => pattern.test(message));
};

router.generateIntelligentFollowups = (message, context) => {
  const baseFollowups = [
    "What are the key risks to consider in this strategy?",
    "How does this compare to regional market trends?",
    "What specific metrics should I track for success?",
    "What's the recommended timeline for implementation?",
    "How do I prioritize these recommendations?"
  ];

  // Customize based on context
  if (context.companies?.some(c => c.crisis_score >= 7)) {
    baseFollowups.unshift("Which companies are in the most urgent need of help right now?");
  }

  return baseFollowups.slice(0, 3);
};

router.extractSourcesSummary = (webData) => {
  return webData.map(item => ({
    source: item.source,
    title: item.data?.title || 'Unknown',
    scraped: item.success
  }));
};

router.saveChatConversation = async (userId, message, response, sessionId) => {
  try {
    await sql`
      INSERT INTO crisis_chat_conversations
      (company_id, user_id, message_content, message_type, session_id)
      VALUES (NULL, ${userId}, ${message}, ${'user_question'}, ${sessionId})
    `;

    await sql`
      INSERT INTO crisis_chat_conversations
      (company_id, user_id, message_content, message_type, session_id)
      VALUES (NULL, ${userId}, ${response}, ${'ai_response'}, ${sessionId})
    `;
  } catch (error) {
    console.error('Failed to save chat conversation:', error);
  }
};

// Placeholder for company knowledge base builder
async function buildCompanyKnowledgeBase() {
  // TODO: Implement actual company data retrieval logic
  // For now, return a mock structure for compatibility
  return { companies: [] };
}

module.exports = router; 