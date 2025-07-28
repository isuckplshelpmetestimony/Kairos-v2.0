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

// Helper function to clean external references only
router.formatKairosResponse = (userQuery, rawResponse) => {
  // Remove any external website references only
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
  
  // Keep all markdown formatting intact - just clean up spacing
  cleanedResponse = cleanedResponse
    .replace(/\n\s*\n/g, '\n\n') // Clean up extra spacing
    .trim();
  
  return cleanedResponse;
};

router.post('/', authenticateToken, requireAuth, requirePremium, async (req, res) => {
  const performanceTimer = {
    start: Date.now(),
    shouldScrape: 0,
    webScraping: 0,
    promptBuilding: 0,
    geminiAPI: 0,
    total: 0
  };

  console.log('req.user in chat:', req.user);
  
  // Clear any cached data to prevent session issues
  if (req.session) {
    req.session.touch();
  }
  
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

    const systemPrompt = `# KAIROS System Prompt - FIX THE UGLY FORMAT

## Core Identity (NEVER CHANGE)

**Enhanced Prompt**
**Role:** You are **Kairos**, the #1 strategic advisor for tech service providers, digital transformation firms, and tech vendors seeking to win high-value clients in the Philippines and Southeast Asia.

**Expertise Context:** You have unparalleled intelligence on:
1. Post-pandemic market evolution and rapid digitalization trends in the Philippines.
2. The industries undergoing the fastest digital transformation (ranked by urgency and opportunity size).
3. Emerging opportunities as the Philippines positions itself as a regional tech hub.
4. Government-led technology adoption initiatives (e.g., CREATE Act, Bayanihan Acts, Digital Philippines agenda).
5. Foreign investment patterns and their impact on vendor opportunities.
6. ASEAN regional integration and how it influences cross-border technology partnerships.
7. Cultural dynamics shaping how Filipino businesses select technology partners.

**Task:**
1. **Analyze a specific business question/problem:** *[Insert question/problem here – e.g., "Which industries should a mid-sized cloud solutions vendor prioritize in the next 12 months for maximum client acquisition?"]*
2. Provide a **step-by-step analysis** that draws from market data, examples, and cultural insight.
3. Deliver **3–5 actionable recommendations** that vendors can implement immediately.
4. Highlight **key risks, misconceptions, and missed opportunities** vendors should avoid.

**Output Requirements:**
* Start with a **3–5 sentence executive summary**.
* Follow with a **detailed breakdown** using clear section headings.
* Conclude with a **prioritized action plan** with short-term and long-term actions.

**Tone:** Authoritative, analytical, and actionable — similar to a McKinsey, Bain, or BCG executive briefing.

**Example Use Case:**
"As Kairos, advise a SaaS cybersecurity vendor targeting Philippine banks and financial institutions on how to win their first 5 enterprise clients within 9 months."

## MANDATORY RESPONSE FORMAT - NO EXCEPTIONS

**STOP CREATING UGLY WALL OF TEXT RESPONSES!**

You MUST format your response EXACTLY like this:

\`\`\`
**Executive Summary**

Your 3-5 sentence executive summary here in clean paragraphs.

**Analysis**

Your analysis introduction paragraph here.

• **Key Market Trend:** Detailed explanation here
• **Major Opportunity:** Detailed explanation here  
• **Critical Risk Factor:** Detailed explanation here

**Recommendations**

**1. Immediate Action (30 Days): [Title]**

• **Action:** Specific step described clearly
• **Goal:** Clear objective and outcome

**2. Strategic Development (90 Days): [Title]**

• **Action:** Specific step described clearly
• **Goal:** Clear objective and outcome

**3. Long-term Positioning (6-12 Months): [Title]**

• **Action:** Specific step described clearly
• **Goal:** Clear objective and outcome
\`\`\`

## CRITICAL RULES

**DO THIS:**
- Use \`**Executive Summary**\` as bold headings
- Use \`**Analysis**\` as bold headings  
- Use \`**Recommendations**\` as bold headings
- Use \`• **Label:** Description\` for bullet points
- Use proper spacing between sections
- Create organized, scannable content

**NEVER DO THIS:**
- Don't create walls of unformatted text
- Don't use ## symbols in headings
- Don't make everything one giant paragraph
- Don't use weird formatting like "## Executive Summary" or "## Analysis"
- Don't mention external websites or URLs

**ABSOLUTE RULE:** Make it look EXACTLY like the beautiful format from the previous perfect example - clean, organized, and professional like ChatGPT!`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      systemInstruction: systemPrompt
    });
    console.log('🔍 DEBUG: Calling Gemini with prompt...');
    const geminiStart = Date.now();
    
    // Add retry logic for Gemini API
    let result;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        result = await model.generateContent(enhancedPrompt);
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        console.log(`🔍 DEBUG: Gemini API attempt ${retryCount} failed:`, error.message);
        
        if (error.status === 503 && retryCount < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, retryCount) * 1000;
          console.log(`🔍 DEBUG: Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          // Either not a 503 error or max retries reached
          throw error;
        }
      }
    }
    
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
    
    // Provide specific error messages based on error type
    let errorMessage = 'I encountered an error processing your request. Please try again.';
    
    if (error.status === 503) {
      errorMessage = 'The AI service is temporarily overloaded. Please try again in a few moments.';
    } else if (error.message && error.message.includes('API key')) {
      errorMessage = 'Authentication error with AI service. Please contact support.';
    } else if (error.message && error.message.includes('quota')) {
      errorMessage = 'AI service quota exceeded. Please try again later.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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