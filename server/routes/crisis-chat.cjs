delete require.cache[require.resolve('../database/connection')];
const connection = require('../database/connection');
const sql = connection.sql || connection;
const { authenticateToken, requireAuth, requirePremium } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const axios = require('axios');
const KnowledgeRetrieval = require('../utils/knowledge-retrieval');

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
    const shouldScrape = router.shouldScrapeWeb(message);
    console.log('🚀 Should scrape:', shouldScrape);

    // Step 2: Get company context and web data if needed
    let webData = [];
    let contextData = {};
    
    if (shouldScrape) {
      console.log('🔍 DEBUG: Web scraping triggered for message:', message);
      
      // Create a mock conversation state for the knowledge retrieval
      const conversationState = {
        memory: [{ user: message }],
        context: { companies_mentioned: [] }
      };
      
      // Create a mock intent object
      const intent = {
        primary_intent: 'web_scrape',
        specific_companies: []
      };
      
      // Create a mock strategy
      const strategy = {
        data_needed: 'contextual'
      };
      
      try {
        console.log('🔍 DEBUG: Calling KnowledgeRetrieval.fetchRelevantData...');
        contextData = await KnowledgeRetrieval.fetchRelevantData(intent, strategy, conversationState);
        console.log('🔍 DEBUG: KnowledgeRetrieval returned:', Object.keys(contextData));
        
        // ADD THESE CRITICAL LOGS:
        console.log('🚀 Context data received:', !!contextData.webContent);
        console.log('🚀 Web content length:', contextData.webContent?.length || 0);
        
        if (contextData.webContent) {
          console.log('🔍 DEBUG: Web content found, length:', contextData.webContent.length);
          console.log('🔍 DEBUG: First 300 chars of web content:', contextData.webContent.substring(0, 300));
          
          webData.push({
            source: 'Firecrawl',
            data: { content: contextData.webContent },
            success: true
          });
          console.log('🔍 DEBUG: ✅ Web data added to webData array');
        } else {
          console.log('🔍 DEBUG: ❌ No web content in contextData');
        }
      } catch (error) {
        console.error('🔍 DEBUG: Error fetching web data:', error);
      }
    } else {
      console.log('🔍 DEBUG: Web scraping not triggered');
    }

    // Step 3: Build company knowledge base
    const companyData = await buildCompanyKnowledgeBase();

    // Step 4: Generate response with enhanced prompting
    let enhancedPrompt = message;
    
    console.log('🔍 DEBUG: Building enhanced prompt...');
    console.log('🔍 DEBUG: Original message:', message);
    console.log('🔍 DEBUG: webData length:', webData.length);
    console.log('🔍 DEBUG: companyData.companies length:', companyData.companies.length);
    
    if (webData.length > 0) {
      const webDataContent = webData.map(item => item.data.content).join('\n\n');
      enhancedPrompt += `\n\nRecent web data:\n${webDataContent}`;
      console.log('🔍 DEBUG: ✅ Web data added to prompt, length:', webDataContent.length);
      console.log('🔍 DEBUG: First 500 chars of web data in prompt:', webDataContent.substring(0, 500));
      console.log('🚀 Enhanced prompt includes web data:', webDataContent.length > 0);
    } else {
      console.log('🔍 DEBUG: ❌ No web data to add to prompt');
    }
    
    if (companyData.companies.length > 0) {
      const companyContext = JSON.stringify(companyData.companies.slice(0, 3), null, 2);
      enhancedPrompt += `\n\nCompany context:\n${companyContext}`;
      console.log('🔍 DEBUG: ✅ Company context added to prompt');
    } else {
      console.log('🔍 DEBUG: ❌ No company data to add to prompt');
    }

    console.log('🔍 DEBUG: Final enhanced prompt length:', enhancedPrompt.length);
    console.log('🔍 DEBUG: First 1000 chars of final prompt:', enhancedPrompt.substring(0, 1000));

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    console.log('🔍 DEBUG: Calling Gemini with prompt...');
    const result = await model.generateContent(enhancedPrompt);
    const aiResponse = result.response.text();
    console.log('🔍 DEBUG: ✅ Gemini response received, length:', aiResponse.length);

    // Step 5: Generate follow-up suggestions
    const followups = router.generateIntelligentFollowups(message, { companies: companyData.companies });

    // Step 6: Save conversation
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
    res.status(500).json({ error: 'I encountered an error processing your request. Please try again.' });
  }
});



// Helper methods
router.shouldScrapeWeb = (message) => {
  const webIndicators = [
    // TEMPORAL: Future/current events always need web search
    /\b(upcoming|future|next|later|soon|coming|happening|scheduled|planned)\b/i,
    /\b(202[5-9]|this year|next year|this month|next month)\b/i,
    
    // TEMPORAL + BUSINESS CONTEXT: Only trigger when combined with business keywords
    /\b(current|latest|recent|new|updated)\b.*\b(market|industry|trend|business|company|event|conference|opportunity)\b/i,
    /\b(market|industry|trend|business|company|event|conference|opportunity)\b.*\b(current|latest|recent|new|updated)\b/i,
    /\b(today|tomorrow)\b.*\b(market|industry|trend|business|company|event|conference|opportunity)\b/i,
    /\b(market|industry|trend|business|company|event|conference|opportunity)\b.*\b(today|tomorrow)\b/i,

    // EVENTS: Conference/business event queries need real-time data
    /\b(conference|summit|event|expo|forum|seminar|workshop|networking|meeting|gathering)\b/i,
    /\b(speaker|presentation|talk|session|registration|ticket|attend)\b/i,

    // BUSINESS INTELLIGENCE: Market queries need fresh data
    /\b(market|industry|trend|analysis|report|business|company|competitor)\b/i,
    /\b(decision maker|ceo|cto|executive|opportunity|prospect|client)\b/i,

    // LOCATION + TIME: Geographic + temporal combinations
    /\b(metro manila|manila|philippines|ph)\b.*\b(upcoming|happening|202[5-9])\b/i,
    /\b(upcoming|happening|202[5-9])\b.*\b(metro manila|manila|philippines)\b/i,

    // SEARCH REQUESTS: Any explicit search intent
    /\b(show me|tell me|find|list|search|look|check|verify|confirm)\b/i,
    /\b(internet|web|online|scrape|crawl|browse)\b/i,

    // CONSULTANT QUESTIONS: Advisory queries need context
    /\b(recommend|suggest|advice|should i|which|best|what.*available)\b/i,

    // ORIGINAL PATTERNS: Preserve existing functionality
    /market trends|industry update|competitive landscape/i,
    /what.*happening|current.*situation/i,
    /scrape.*internet|search.*internet|web.*data|live.*data/i,
    /scrape|search the internet|web scraping|crawl/i
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
  console.log('🔍 DEBUG: extractSourcesSummary called with webData length:', webData.length);
  console.log('🔍 DEBUG: webData content:', JSON.stringify(webData, null, 2));
  
  const result = webData.map(item => ({
    source: item.source,
    title: item.data?.title || 'Unknown',
    scraped: item.success
  }));
  
  console.log('🔍 DEBUG: extractSourcesSummary result:', JSON.stringify(result, null, 2));
  return result;
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

// Simple Firecrawl connectivity test
router.get('/test-firecrawl', async (req, res) => {
  try {
    const firecrawlUrl = process.env.FIRECRAWL_URL;

    // Test search functionality
    const testSearch = await axios.post(`${firecrawlUrl}/v1/search`, {
      query: "tech conferences Manila",
      limit: 1,
      scrapeOptions: { formats: ['markdown'], onlyMainContent: true }
    });

    console.log('🧪 Test search status:', testSearch.status);
    console.log('🧪 Test results count:', testSearch.data?.data?.length || 0);

    res.json({
      status: 'success',
      firecrawlUrl,
      responseStatus: testSearch.status,
      resultsFound: testSearch.data?.data?.length || 0
    });

  } catch (error) {
    console.error('🧪 Firecrawl test failed:', error.message);
    res.status(500).json({
      status: 'failed',
      error: error.message
    });
  }
});

module.exports = router; 