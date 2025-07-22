const { sql } = require('../database/connection');
const { requireAuth, requirePremium } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const LocalFirecrawlService = require('../services/local-firecrawl-service');
const EnhancedPrompts = require('../utils/enhanced-prompts');
const ContextOptimizer = require('../utils/context-optimizer');
const statusManager = require('../utils/status-manager');
const express = require('express');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', requireAuth, requirePremium, async (req, res) => {
  try {
    const { message, session_id } = req.body;
    const userId = req.user.id;
    const sessionId = session_id || `session_${Date.now()}`;

    console.log(`Enhanced chat request from user ${userId}: ${message}`);

    // Step 1: Analyze intent and decide if we need web scraping
    statusManager.updateStatus(sessionId, '🎯 Understanding your question...', 'analyzing');

    const needsWebScraping = router.shouldScrapeWeb(message);

    // Step 2: Get company context
    statusManager.updateStatus(sessionId, '📊 Gathering company intelligence...', 'analyzing');
    const companyContext = await buildCompanyKnowledgeBase();

    let webData = [];
    if (needsWebScraping) {
      // Step 3: Scrape web data if needed
      statusManager.updateStatus(sessionId, '🌐 Searching latest market information...', 'searching');

      const firecrawlService = new LocalFirecrawlService();
      try {
        webData = await firecrawlService.searchPhilippineBusinessNews(message, 3);
      } catch (error) {
        console.warn('Web scraping failed, continuing with company data only:', error.message);
      }
    }

    // Step 4: Optimize context for free Gemini
    statusManager.updateStatus(sessionId, '🧠 Processing information...', 'reasoning');

    const optimizedContext = ContextOptimizer.optimizeForFreeGemini(companyContext, webData, message);

    // Step 5: Generate response with enhanced prompting
    statusManager.updateStatus(sessionId, '✍️ Crafting strategic insights...', 'generating');

    const enhancedPrompt = EnhancedPrompts.buildContextualPrompt(message, optimizedContext, webData);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(enhancedPrompt);
    const aiResponse = result.response.text();

    // Step 6: Generate follow-up suggestions
    const followups = router.generateIntelligentFollowups(message, optimizedContext);

    // Clear status
    statusManager.clearStatus(sessionId);

    // Save to database
    await router.saveChatConversation(userId, message, aiResponse, sessionId);

    res.json({
      ai_response: aiResponse,
      response_time_ms: Date.now() - (req.startTime || Date.now()),
      suggested_followups: followups,
      sources_used: router.extractSourcesSummary(webData),
      session_id: sessionId
    });

  } catch (error) {
    console.error('Enhanced chat error:', error);
    statusManager.updateStatus(req.body.session_id, '❌ Error processing request', 'error');
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
    await sql(
      `INSERT INTO crisis_chat_conversations
       (company_id, user_id, message_content, message_type, session_id)
       VALUES (NULL, $1, $2, $3, $4)`,
      [userId, message, 'user_question', sessionId]
    );

    await sql(
      `INSERT INTO crisis_chat_conversations
       (company_id, user_id, message_content, message_type, session_id)
       VALUES (NULL, $1, $2, $3, $4)`,
      [userId, response, 'ai_response', sessionId]
    );
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