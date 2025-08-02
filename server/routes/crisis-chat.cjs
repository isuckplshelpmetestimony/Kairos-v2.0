delete require.cache[require.resolve('../database/connection')];
const connection = require('../database/connection');
const sql = connection.sql || connection;
const { authenticateToken, requireAuth, requirePremium } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const axios = require('axios');
const KnowledgeRetrieval = require('../utils/knowledge-retrieval');
const { asyncHandler, ValidationError, RateLimitError, DatabaseError } = require('../middleware/errorHandler.js');
const { validate, sanitize } = require('../middleware/validation.js');
const { chatMessageSchema } = require('../schemas/chatSchemas.js');

const router = express.Router();
const { config } = require('../config/index.js');
const genAI = new GoogleGenerativeAI(config.ai.geminiApiKey);

// Add this test route to verify server functionality
router.get('/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    database: process.env.DATABASE_URL ? 'Configured' : 'Missing',
    gemini: process.env.GEMINI_API_KEY ? 'Configured' : 'Missing',
    jwt: process.env.JWT_SECRET ? 'Configured' : 'Missing'
  });
});

// Chat endpoint with Gemini API and web scraping
router.post('/', authenticateToken, requireAuth, requirePremium, sanitize, validate(chatMessageSchema), asyncHandler(async (req, res) => {
  const { message, session_id } = req.body;
  const sessionId = session_id || `session_${Date.now()}`;

  console.log(`Chat request: ${message}`);

  // Step 1: Web scraping (if enabled)
  let webData = [];
  if (config.scraping.isFirecrawlEnabled) {
    try {
      const conversationState = {
        memory: [{ user: message }],
        context: { companies_mentioned: [] }
      };
      
      const intent = {
        primary_intent: 'web_scrape',
        specific_companies: []
      };
      
      const strategy = {
        data_needed: 'contextual'
      };
      
      const contextData = await KnowledgeRetrieval.fetchRelevantData(intent, strategy, conversationState);
      
      if (contextData.webContent) {
        webData.push({
          source: 'Firecrawl',
          data: { content: contextData.webContent },
          success: true
        });
        console.log('✅ Web data added to context');
      }
    } catch (error) {
      console.log('⚠️ Web scraping failed:', error.message);
    }
  }

  // Step 2: Build prompt with web data
  let enhancedPrompt = message;
  if (webData.length > 0) {
    const webDataContent = webData.map(item => item.data.content).join('\n\n');
    enhancedPrompt += `\n\nRecent web data:\n${webDataContent}`;
  }

  // Step 3: Gemini API call
  let aiResponse = "I'm here to help! What would you like to know about tech opportunities in the Philippines?";
  
  if (config.ai.isGeminiEnabled) {
    try {
      const systemPrompt = `You are Kairos, the #1 strategic advisor for tech service providers, digital transformation firms, and tech vendors seeking to win high-value clients in the Philippines and Southeast Asia.

Provide authoritative, analytical, and actionable advice similar to McKinsey, Bain, or BCG executive briefings.

Format your response with:
- Executive Summary (3-5 sentences)
- Analysis with key points
- Recommendations with actionable steps`;

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro",
        systemInstruction: systemPrompt
      });
      
      const result = await model.generateContent(enhancedPrompt);
      aiResponse = result.response.text();
      console.log('✅ Gemini API response received');
    } catch (error) {
      console.log('⚠️ Gemini API failed:', error.message);
    }
  } else {
    console.log('ℹ️ Gemini AI not configured');
  }

  // Step 4: Return response
  res.json({
    ai_response: aiResponse,
    response_time_ms: 100,
    suggested_followups: [
      "Tell me about tech opportunities in the Philippines",
      "What industries are growing fastest?",
      "How can I find clients in the Philippines?"
    ],
    sources_used: webData.map(item => ({
      source: item.source,
      title: 'Web Search Result',
      scraped: item.success,
      type: 'web_content'
    })),
    session_id: sessionId
  });
}));

module.exports = router; 