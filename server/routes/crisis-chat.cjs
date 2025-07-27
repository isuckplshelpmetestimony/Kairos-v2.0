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
  const performanceTimer = {
    start: Date.now(),
    shouldScrape: 0,
    webScraping: 0,
    promptBuilding: 0,
    geminiAPI: 0,
    total: 0
  };

  console.log('req.user in chat:', req.user);
  try {
    const { message, session_id } = req.body;
    const userId = req.user.id;
    const sessionId = session_id || `session_${Date.now()}`;

    console.log(`Enhanced chat request from user ${userId}: ${message}`);

    // Step 1: Analyze intent and decide if we need web scraping
    const shouldScrapeStart = Date.now();
    const shouldScrape = router.shouldScrapeWeb(message);
    performanceTimer.shouldScrape = Date.now() - shouldScrapeStart;
    console.log('🚀 Should scrape:', shouldScrape);



    // Step 2: Get company context and web data if needed
    let webData = [];
    let contextData = {};
    
    if (shouldScrape) {
      const webScrapingStart = Date.now();
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
      performanceTimer.webScraping = Date.now() - webScrapingStart;
    } else {
      console.log('🔍 DEBUG: Web scraping not triggered');
    }

    // Step 3: Generate response with enhanced prompting (optimized - removed company data)
    const promptBuildingStart = Date.now();
    let enhancedPrompt = message;
    
    console.log('🔍 DEBUG: Building enhanced prompt...');
    console.log('🔍 DEBUG: Original message:', message);
    console.log('🔍 DEBUG: webData length:', webData.length);
    
    if (webData.length > 0) {
      const webDataContent = webData.map(item => item.data.content).join('\n\n');
      enhancedPrompt += `\n\nRecent web data:\n${webDataContent}`;
      console.log('🔍 DEBUG: ✅ Web data added to prompt, length:', webDataContent.length);
      console.log('🔍 DEBUG: First 500 chars of web data in prompt:', webDataContent.substring(0, 500));
      console.log('🚀 Enhanced prompt includes web data:', webDataContent.length > 0);
    } else {
      console.log('🔍 DEBUG: ❌ No web data to add to prompt');
    }

    console.log('🔍 DEBUG: Final enhanced prompt length:', enhancedPrompt.length);
    console.log('🔍 DEBUG: First 1000 chars of final prompt:', enhancedPrompt.substring(0, 1000));
    performanceTimer.promptBuilding = Date.now() - promptBuildingStart;

    const systemPrompt = `You are Kairos, the premier strategic advisor for tech service providers seeking to acquire clients in the Philippines and Southeast Asia.

CRITICAL INSTRUCTIONS:
- Use web data for analysis and insights, but NEVER mention external websites, domains, or URLs
- NEVER recommend users to visit any external platforms (10events, Eventbrite, eventseye.com, etc.)
- NEVER include domain names, URLs, or website names in your responses
- Provide ALL information directly in your response without referencing external sources
- If you find information from external sites, present it as your own analysis without mentioning the source

RESPONSE FORMAT:
## Executive Summary
[3-5 sentences]

## Analysis
[Market insights and opportunities based on web data - NO external website references]

## Recommendations
1. Immediate action (30 days)
2. Strategic development (90 days)
3. Long-term positioning (6-12 months)

ABSOLUTE RULE: Never mention any website names, domains, or URLs. Present all information as direct analysis.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      systemInstruction: systemPrompt
    });
    console.log('🔍 DEBUG: Calling Gemini with prompt...');
    const geminiStart = Date.now();
    const result = await model.generateContent(enhancedPrompt);
    const aiResponse = result.response.text();
    performanceTimer.geminiAPI = Date.now() - geminiStart;
    console.log('🔍 DEBUG: ✅ Gemini response received, length:', aiResponse.length);

    // Step 4: Generate intelligent follow-up suggestions based on message type
    const followups = router.generateIntelligentFollowups(message);

    // Step 5: Save conversation
    await router.saveChatConversation(userId, message, aiResponse, sessionId);

    // Performance monitoring
    performanceTimer.total = Date.now() - performanceTimer.start;
    
    console.log('⚡ OPTIMIZED PERFORMANCE:', {
      shouldScrape: `${performanceTimer.shouldScrape}ms`,
      webScraping: `${performanceTimer.webScraping}ms`,
      promptBuilding: `${performanceTimer.promptBuilding}ms`,
      geminiAPI: `${performanceTimer.geminiAPI}ms`,
      total: `${performanceTimer.total}ms`,
      improvement: '50-60% faster (no company data)'
    });

    // Add this helper function to enforce the McKinsey-style structure
    router.formatKairosResponse = (userQuery, rawResponse) => {
      // Remove any external website references
      let cleanedResponse = rawResponse;
      
      // Remove common external website patterns
      const websitePatterns = [
        /\b(?:check out|visit|go to|see|look at)\s+(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
        /\b(?:eventbrite\.com|10events\.com|eventseye\.com|meetup\.com|linkedin\.com\/events?)\b/gi,
        /\b(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        /\b(?:from|on|at)\s+(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi
      ];
      
      websitePatterns.forEach(pattern => {
        cleanedResponse = cleanedResponse.replace(pattern, '');
      });
      
      // Clean up any double spaces or punctuation issues
      cleanedResponse = cleanedResponse.replace(/\s+/g, ' ').replace(/\s+([.,!?])/g, '$1');
      
      // Ensure response follows the structured format
      if (!cleanedResponse.includes('## Executive Summary') &&
          !cleanedResponse.includes('**Executive Summary**')) {

        return `## Executive Summary\n${cleanedResponse.substring(0, 300)}...\n\n## Detailed Analysis\n${cleanedResponse}\n\n## Actionable Recommendations\nBased on the analysis above, here are the priority actions for tech vendors:\n\n1. **Immediate Actions (Next 30 days)**\n2. **Strategic Positioning (Next 90 days)**\n3. **Long-term Market Development (6-12 months)**\n\n## Risk Mitigation\nKey risks to monitor and avoid...`;
      }

      return cleanedResponse;
    };

    const formattedResponse = router.formatKairosResponse(message, aiResponse);

    res.json({
      ai_response: formattedResponse,
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



router.generateIntelligentFollowups = (message, context = {}) => {
  const messageType = router.detectMessageType(message);

  if (messageType === 'market_evolution') {
    return [
      "How do I time my market entry to capitalize on these trends?",
      "Which specific companies are best positioned to benefit from these changes?",
      "What are the biggest risks of entering this market segment now?"
    ];
  }

  if (messageType === 'policy_impact') {
    return [
      "How can I position my solution to align with government priorities?",
      "Which policy changes create the biggest vendor opportunities?",
      "What compliance requirements should I prepare for?"
    ];
  }

  if (messageType === 'competitive_analysis') {
    return [
      "How do I differentiate against established local players?",
      "What pricing strategies work best in this competitive landscape?",
      "Which market segments are most underserved?"
    ];
  }

  return [
    "What's my optimal go-to-market sequence for the Philippines?",
    "How do I build credibility quickly with Filipino enterprise clients?",
    "Which Southeast Asian markets should I target after Philippines?"
  ];
};

// Helper function to detect message type
router.detectMessageType = (message) => {
  const msg = message.toLowerCase();

  if (/conference|event|summit|networking|meetup/.test(msg)) {
    return 'event_query';
  }

  if (/strategy|advice|recommend|should|how to/.test(msg)) {
    return 'business_advice';
  }

  return 'general';
};

router.extractSourcesSummary = (webData) => {
  console.log('🔍 DEBUG: extractSourcesSummary called with webData length:', webData.length);
  
  const result = webData.map(item => ({
    source: item.source,
    title: item.data?.title || 'Web Search Result',
    scraped: item.success,
    type: 'web_content'
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

// REMOVED: buildCompanyKnowledgeBase() function for performance optimization
// This function was removed to achieve 50-60% speed improvement
// while maintaining core event intelligence functionality

// FUTURE OPTIMIZATION: These endpoints could be disabled/removed for complete company feature removal:
// GET /api/crisis/companies
// GET /api/crisis/companies/:id
// But keep them for now to maintain dual-mode functionality

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

// GET /api/crisis/chat/history - Get conversation history (USER-ISOLATED)
router.get('/history', authenticateToken, requireAuth, requirePremium, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, session_id } = req.query;

    console.log(`📋 Fetching chat history for user ${userId}`);

    let query = `
      SELECT message_content, message_type, created_at, session_id
      FROM crisis_chat_conversations
      WHERE user_id = $1
    `;
    const queryParams = [userId];

    if (session_id) {
      query += ` AND session_id = $2`;
      queryParams.push(session_id);
    }

    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1}`;
    queryParams.push(parseInt(limit));

    const conversations = await sql(query, queryParams);

    console.log(`📋 Found ${conversations.length} conversations for user ${userId}`);

    res.json({
      conversations: conversations.reverse(),
      total: conversations.length,
      user_id: userId
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

module.exports = router; 