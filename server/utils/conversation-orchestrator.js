const ConversationState = require('./conversation-state');
const IntentEngine = require('./intent-engine');
const ResponseStrategy = require('./response-strategy');
const KnowledgeRetrieval = require('./knowledge-retrieval');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class ConversationOrchestrator {
  static async processMessage(message, userId, sessionId) {
    try {
      console.log(`Processing message from user ${userId}: "${message.substring(0, 50)}..."`);

      // Step 1: Load or create conversation state
      const conversationState = await ConversationState.load(userId, sessionId);

      // Step 2: Understand user intent
      const intent = await IntentEngine.analyzeIntent(message, conversationState);
      console.log(`Intent detected: ${intent.primary_intent} (${intent.information_need} need, ${intent.urgency} urgency)`);

      // Step 3: Select response strategy
      const strategy = ResponseStrategy.selectStrategy(intent, conversationState);
      console.log(`Strategy selected: ${strategy.approach} approach, ${strategy.response_length} length`);

      // Step 4: Fetch relevant data
      const relevantData = await KnowledgeRetrieval.fetchRelevantData(intent, strategy, conversationState);
      console.log(`Data fetched: ${Object.keys(relevantData).join(', ')}`);

      // Step 5: Generate response
      const response = await this.generateResponse(message, intent, strategy, relevantData, conversationState);

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
    return `You are Kairos, a business consultant specializing in Philippine markets and digital transformation. You have access to crisis intelligence on 93+ Philippine companies.

PERSONALITY:
- Conversational and approachable, like talking to a knowledgeable friend
- Direct and honest about business realities
- Focused on actionable insights and practical advice
- Remember context from our conversation

COMMUNICATION STYLE:
- Talk naturally, not like a corporate robot
- Use specific examples from the data when relevant
- Ask follow-up questions when you need clarification
- Admit when you don't have specific information`;
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