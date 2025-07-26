const ConversationState = require('./conversation-state');
const IntentEngine = require('./intent-engine');
const ResponseStrategy = require('./response-strategy');
const KnowledgeRetrieval = require('./knowledge-retrieval');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class ConversationOrchestrator {
  static async processMessage(message, userId, sessionId) {
    try {
      console.log(`🔍 DEBUG: Processing message: "${message}"`);

      // Step 1: Load or create conversation state
      const conversationState = await ConversationState.load(userId, sessionId);

      // Step 2: Understand user intent
      const intent = await IntentEngine.analyzeIntent(message, conversationState);
      console.log(`🎯 DEBUG: Intent detected:`, {
        primary_intent: intent.primary_intent,
        information_need: intent.information_need,
        urgency: intent.urgency
      });

      // Step 3: Select response strategy
      const strategy = ResponseStrategy.selectStrategy(intent, conversationState);
      console.log(`📋 DEBUG: Strategy selected:`, {
        approach: strategy.approach,
        response_length: strategy.response_length,
        data_needed: strategy.data_needed
      });

      // Step 4: Fetch relevant data
      const relevantData = await KnowledgeRetrieval.fetchRelevantData(intent, strategy, conversationState);
      console.log(`📊 DEBUG: Data fetched:`, {
        companies_count: relevantData.companies?.length || 0,
        has_summary: !!relevantData.summary,
        data_keys: Object.keys(relevantData)
      });

      // Step 5: Before generating response
      const prompt = this.buildPrompt(message, intent, strategy, relevantData, conversationState);
      console.log(`✍️ DEBUG: Prompt length: ${prompt.length} characters`);
      console.log(`✍️ DEBUG: Prompt preview: ${prompt.substring(0, 200)}...`);

      const response = await this.generateResponse(message, intent, strategy, relevantData, conversationState);
      console.log(`✅ DEBUG: Response length: ${response.length} characters`);

      // Step 6: Generate contextual follow-ups
      const followUps = this.generateFollowUps(intent, strategy, conversationState, relevantData);

      // Step 7: Update conversation state
      conversationState.updateContext(message, response);
      await conversationState.save();

      return {
        response,
        followUps,
        conversationStage: conversationState.context.conversation_stage,
        intent: intent.primary_intent
      };

    } catch (error) {
      console.error('Orchestrator error:', error);
      throw new Error('I had trouble processing that. Could you try rephrasing?');
    }
  }

  static async generateResponse(message, intent, strategy, data, conversationState) {
    try {
      const prompt = this.buildPrompt(message, intent, strategy, data, conversationState);

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      return this.getFallbackResponse(intent);
    }
  }

  static buildPrompt(message, intent, strategy, data, conversationState) {
    let basePrompt = this.getBasePersonality();

    // Special handling for greeting intent: short, friendly, no analysis
    if (intent.primary_intent === 'greeting') {
      basePrompt += `\n\nThe user just greeted you. Respond as Kairos, the Philippine business consultant. Always introduce yourself as \"Kairos, your Philippine business consultant\" (never as a generic AI or language model). Give a short, friendly welcome and ask what they'd like to know about Philippine business. Do NOT provide a market overview, analysis, or company data unless asked.`;
      basePrompt += `\nUser's current message: \"${message}\"\n\nRespond naturally and helpfully:`;
      return basePrompt;
    }

    // If web scraped content is present, include it in the prompt
    if (data.webContent) {
      basePrompt += `\n\nWEB SCRAPED CONTENT (from the latest web search or crawl):\n${data.webContent}\n`;
    }

    // Add conversation context if available
    if (conversationState.memory.length > 0) {
      basePrompt += `\n\nCONVERSATION CONTEXT:\n`;
      const recentExchanges = conversationState.memory.slice(-2);
      recentExchanges.forEach((exchange, index) => {
        basePrompt += `Previous ${index + 1}: User: "${exchange.user}" | You: "${exchange.ai.substring(0, 100)}..."\n`;
      });
    }

    // Add relevant data based on strategy
    if (data.companies && data.companies.length > 0) {
      basePrompt += `\n\nRELEVANT COMPANY DATA:\n`;
      data.companies.slice(0, strategy.response_length === 'short' ? 3 : 8).forEach(company => {
        basePrompt += `• ${company.company_name} (${company.industry_sector}): Crisis ${company.crisis_score}/10, ${company.crisis_category.replace('_', ' ')}\n`;
        if (company.primary_crisis_signals) {
          basePrompt += `  Signals: ${company.primary_crisis_signals.substring(0, 150)}...\n`;
        }
        if (company.full_name) {
          basePrompt += `  Contact: ${company.full_name} (${company.job_title})\n`;
        }
      });
    }

    if (data.summary) {
      basePrompt += `\n\nMARKET SUMMARY:\n`;
      if (data.summary.total_companies) {
        basePrompt += `Total companies tracked: ${data.summary.total_companies}, High crisis: ${data.summary.high_crisis}\n`;
      }
    }

    // Add strategy-specific instructions
    basePrompt += `\n\nRESPONSE INSTRUCTIONS:\n`;
    basePrompt += `Intent: ${intent.primary_intent} | Strategy: ${strategy.approach} | Length: ${strategy.response_length}\n`;

    if (strategy.prompt_style === 'friendly') {
      basePrompt += `Be warm and welcoming. This user is ${conversationState.memory.length === 0 ? 'new' : 'returning'}.\n`;
    } else if (strategy.prompt_style === 'consultative') {
      basePrompt += `Act as a strategic business consultant. Provide actionable advice and insights.\n`;
    } else if (strategy.prompt_style === 'analytical') {
      basePrompt += `Focus on data-driven analysis and specific insights from the company intelligence.\n`;
    } else if (strategy.prompt_style === 'urgent') {
      basePrompt += `Address the urgency in their question. Provide immediate, actionable guidance.\n`;
    }

    if (strategy.response_length === 'short') {
      basePrompt += `Keep your response concise - 2-3 sentences maximum.\n`;
    } else if (strategy.response_length === 'long') {
      basePrompt += `Provide a comprehensive response with specific examples and actionable recommendations.\n`;
    }

    basePrompt += `\nUser's current message: "${message}"\n\nRespond naturally and helpfully:`;

    return basePrompt;
  }

  static getBasePersonality() {
    return `Role: You are Kairos, the premier strategic advisor for tech service providers, digital transformation companies, and tech vendors seeking to acquire high-value clients in the Philippines and Southeast Asia. Your unique strength lies in synthesizing market intelligence, cultural insights, and policy trends into actionable strategies.

Context & Expertise: You have unmatched knowledge of:
1. Post-pandemic and digitalization-driven shifts in the Philippine market.
2. Industries with the highest velocity of digital transformation (ranked by opportunity).
3. Emerging opportunities as the Philippines positions itself as a regional tech hub.
4. Key government initiatives (e.g., CREATE Act, Bayanihan Acts, Digital Philippines agenda) and how they influence vendor opportunities.
5. Foreign investment patterns and how these drive market demand.
6. ASEAN regional integration and its impact on cross-border technology partnerships.
7. Cultural dynamics shaping how Filipino businesses evaluate and select technology partners.

Output Format:
• Start with a brief executive summary (3–5 sentences).
• Follow with a detailed analysis (use subheadings).
• Conclude with a prioritized action plan with 3–5 actionable recommendations.
• Highlight risks, opportunities, and potential misconceptions to avoid.

Tone: Authoritative, analytical, yet practical (like McKinsey or BCG reports).`;
  }

  static generateFollowUps(intent, strategy, conversationState, data) {
    const baseFollowUps = [
      "What specific challenges should I be most concerned about?",
      "How does this compare to regional trends?",
      "What would you do if you were in their position?",
      "Are there any success stories I should study?",
      "What's the timeline for addressing these issues?"
    ];

    const contextualFollowUps = [];

    // Intent-specific follow-ups
    if (intent.primary_intent === 'company_inquiry') {
      contextualFollowUps.push(
        "Who are the key decision makers I should contact?",
        "What's their biggest competitive threat right now?",
        "How urgent is their situation?"
      );
    } else if (intent.primary_intent === 'strategy_advice') {
      contextualFollowUps.push(
        "What are the biggest risks with this approach?",
        "Which companies have tried similar strategies?",
        "What resources would I need for implementation?"
      );
    } else if (intent.primary_intent === 'crisis_analysis') {
      contextualFollowUps.push(
        "Which companies have successfully turned things around?",
        "What are the warning signs I should watch for?",
        "How long do companies typically have to address these issues?"
      );
    } else if (intent.primary_intent === 'greeting') {
      contextualFollowUps.push(
        "Which companies are in the most trouble right now?",
        "What's the biggest trend affecting Philippine businesses?",
        "Show me companies that are actually doing well"
      );
    }

    // Add data-specific follow-ups
    if (data.companies && data.companies.length > 0) {
      const industrySet = new Set(data.companies.map(c => c.industry_sector));
      if (industrySet.size > 1) {
        contextualFollowUps.push(`How do these industries compare to each other?`);
      }
    }

    // Combine and limit to 3
    const allFollowUps = [...contextualFollowUps, ...baseFollowUps];
    return allFollowUps.slice(0, 3);
  }

  static getFallbackResponse(intent) {
    const fallbacks = {
      'greeting': "Hello! I'm Kairos, your Philippine business consultant. I'm having a technical issue right now, but I'm here to help with company analysis and market insights. What would you like to know?",
      'company_inquiry': "I have detailed information about Philippine companies, but I'm experiencing a technical issue accessing it right now. Could you try asking about a specific company?",
      'strategy_advice': "I'd love to help with strategic advice about the Philippine market. I'm having a technical issue, but feel free to ask about specific business challenges.",
      'default': "I'm experiencing a technical issue right now, but I'm here to help with Philippine business intelligence. Could you try rephrasing your question?"
    };

    return fallbacks[intent.primary_intent] || fallbacks['default'];
  }
}

module.exports = ConversationOrchestrator; 