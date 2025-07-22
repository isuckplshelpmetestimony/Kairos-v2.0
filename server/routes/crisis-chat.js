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

// Enhanced simple message detection
router.isSimpleMessage = (message) => {
  const trimmed = message.trim().toLowerCase();

  // Short messages (under 10 characters) are usually simple
  if (trimmed.length < 10) return true;

  const simplePatterns = [
    // Greetings
    /^(hi|hello|hey|yo|sup|what's up|good morning|good afternoon|good evening|greetings?)!?$/i,

    // Simple questions
    /^(how are you|what can you do|who are you|what do you do|help me|can you help)[\?!]?$/i,

    // Simple responses
    /^(ok|okay|thanks|thank you|yes|no|sure|cool|nice|great|awesome)!?$/i,

    // Testing messages
    /^(test|testing|ping|pong|check|status)$/i,

    // Single words
    /^\w+[\?!]?$/
  ];

  return simplePatterns.some(pattern => pattern.test(trimmed));
};

router.generateQuickResponse = (message) => {
  const trimmed = message.trim().toLowerCase();

  // Greeting responses
  if (/^(hi|hello|hey|yo|sup|what's up|good morning|good afternoon|good evening|greetings?)/.test(trimmed)) {
    return "Hello! I'm Kairos, your Philippine business consultant. I analyze 93+ companies and provide strategic insights about digital transformation and market trends. What would you like to explore?";
  }

  // About me responses
  if (/^(how are you|who are you|what do you do|what can you do)/.test(trimmed)) {
    return "I'm Kairos, an AI business consultant specializing in the Philippine market. I can help you with company analysis, digital transformation strategies, crisis intelligence, and market insights. Ask me anything about Philippine businesses!";
  }

  // Help responses
  if (/^(help|can you help|help me)/.test(trimmed)) {
    return "I can help you with:\n• Company crisis analysis and intelligence\n• Digital transformation strategies\n• Philippine market insights\n• Business consultation and advice\n\nJust ask me about any Philippine company or business topic!";
  }

  // Thanks responses
  if (/^(thanks|thank you|ok|okay)/.test(trimmed)) {
    return "You're welcome! Feel free to ask me anything about Philippine companies, market trends, or business strategy. I'm here to help!";
  }

  // Test responses
  if (/^(test|testing|ping|check|status)/.test(trimmed)) {
    return "System status: ✅ Online and ready! I have access to crisis intelligence on 93+ Philippine companies and can provide real-time business insights.";
  }

  // Default for other simple messages
  return "I'm here and ready to help! Ask me about Philippine companies, digital transformation challenges, market analysis, or business strategy. What interests you?";
};

// UPDATED CHAT ROUTE
router.post('/chat', requireAuth, requirePremium, async (req, res) => {
  try {
    const { message, session_id } = req.body;
    const userId = req.user.id;
    const sessionId = session_id || `session_${Date.now()}`;

    // FAST PATH: Handle all simple messages instantly
    if (router.isSimpleMessage(message)) {
      const quickResponse = router.generateQuickResponse(message);

      await router.saveChatConversation(userId, message, quickResponse, sessionId);

      return res.json({
        ai_response: quickResponse,
        response_time_ms: 50, // Super fast!
        suggested_followups: [
          "Which companies have the highest crisis scores?",
          "What's the latest in Philippine digital transformation?",
          "Show me companies in the banking sector crisis",
          "How should I approach the Philippine market?"
        ],
        session_id: sessionId
      });
    }

    // COMPLEX PATH: Full AI analysis for detailed questions
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