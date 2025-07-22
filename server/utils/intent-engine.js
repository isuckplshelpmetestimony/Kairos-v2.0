class IntentEngine {
  static async analyzeIntent(message, conversationState) {
    const trimmedMessage = message.trim().toLowerCase();

    const intent = {
      primary_intent: 'unknown',
      urgency: 'normal',
      scope: 'general',
      information_need: 'medium',
      follow_up: false,
      specific_companies: []
    };

    // Check if follow-up
    if (conversationState.isFollowUp(message)) {
      intent.follow_up = true;
      intent.primary_intent = this.inferFollowUpIntent(conversationState);
    }

    // Web scraping intent (must come before other checks)
    else if (this.isWebScrape(trimmedMessage)) {
      intent.primary_intent = 'web_scrape';
      intent.information_need = 'high';
      intent.scope = 'broad';
    }

    // Greeting detection
    else if (this.isGreeting(trimmedMessage)) {
      intent.primary_intent = 'greeting';
      intent.information_need = 'low';
      intent.scope = 'general';
    }

    // Company-specific inquiry
    else if (this.isCompanySpecific(message)) {
      intent.primary_intent = 'company_inquiry';
      intent.scope = 'specific';
      intent.information_need = 'high';
      intent.specific_companies = this.extractCompanyNames(message);
    }

    // Strategy/advice seeking
    else if (this.isStrategicAdvice(trimmedMessage)) {
      intent.primary_intent = 'strategy_advice';
      intent.information_need = 'high';
      intent.scope = 'broad';
    }

    // Market research
    else if (this.isMarketResearch(trimmedMessage)) {
      intent.primary_intent = 'market_research';
      intent.information_need = 'high';
      intent.scope = 'broad';
    }

    // Crisis/problem analysis
    else if (this.isCrisisInquiry(trimmedMessage)) {
      intent.primary_intent = 'crisis_analysis';
      intent.urgency = 'high';
      intent.information_need = 'high';
    }

    // Contact/decision maker inquiry
    else if (this.isContactInquiry(trimmedMessage)) {
      intent.primary_intent = 'contact_inquiry';
      intent.information_need = 'medium';
    }

    // Set urgency indicators
    if (this.hasUrgencyIndicators(trimmedMessage)) {
      intent.urgency = 'urgent';
    }

    // Adjust based on conversation stage
    if (conversationState.context.conversation_stage === 'deep_conversation') {
      intent.information_need = conversationState.context.depth_preference === 'brief' ? 'low' : 'high';
    }

    return intent;
  }

  static isWebScrape(message) {
    // Detects if the user is asking for web scraping, crawling, or live web data
    return /\b(scrape|scraping|crawl|crawling|search the internet|search online|web data|live data|latest information|fetch from web|get from web|scrape the internet|scrape news|scrape for|scrape about|scrape on|scrape\b.*?\bfor|scrape\b.*?\bon|scrape\b.*?\babout)\b/i.test(message);
  }

  static isGreeting(message) {
    const greetingPatterns = [
      /^(hi|hello|hey|yo|sup|what's up|good morning|good afternoon|good evening|greetings?)!?$/,
      /^(how are you|what can you do|who are you|what do you do|help me|can you help)[\?!]?$/,
      /^(thanks|thank you|ok|okay|yes|no|sure|cool|nice|great|awesome)!?$/,
      /^(test|testing|ping|pong|check|status)$/,
      /^\w{1,8}[\?!]?$/
    ];
    return greetingPatterns.some(pattern => pattern.test(message));
  }

  static isCompanySpecific(message) {
    const companyPatterns = [
      /\b([A-Z][a-zA-Z\s]+(?:Corp|Inc|Bank|Group|Company|Airlines))\b/,
      /\b(BPI|BDO|Metrobank|PLDT|Globe|Ayala|SM|Jollibee|Philippine Airlines|PAL)\b/i,
      /tell me about|analyze|what about.*company/i
    ];
    return companyPatterns.some(pattern => pattern.test(message));
  }

  static isStrategicAdvice(message) {
    const strategyPatterns = [
      /should I|how do I|what would you|recommend|strategy|approach/i,
      /best way|how to|advice|suggest|guidance/i,
      /market entry|expansion|investment|approach/i
    ];
    return strategyPatterns.some(pattern => pattern.test(message));
  }

  static isMarketResearch(message) {
    const marketPatterns = [
      /market trends|industry analysis|competitive landscape|market size/i,
      /what.*happening.*market|market conditions|industry outlook/i,
      /competitors|competition|market share/i
    ];
    return marketPatterns.some(pattern => pattern.test(message));
  }

  static isCrisisInquiry(message) {
    const crisisPatterns = [
      /crisis|problem|struggling|failing|trouble|issues|challenges/i,
      /bankruptcy|layoffs|losses|declining|dropping/i,
      /urgent|emergency|immediate|critical/i
    ];
    return crisisPatterns.some(pattern => pattern.test(message));
  }

  static isContactInquiry(message) {
    const contactPatterns = [
      /who should I contact|decision maker|CEO|executive|contact/i,
      /email|phone|reach out|get in touch/i
    ];
    return contactPatterns.some(pattern => pattern.test(message));
  }

  static hasUrgencyIndicators(message) {
    return /urgent|asap|immediate|emergency|quickly|now|today/i.test(message);
  }

  static extractCompanyNames(message) {
    const companyPattern = /\b([A-Z][a-zA-Z\s]+(?:Corp|Inc|Bank|Group|Company|Airlines))\b/g;
    const matches = message.match(companyPattern) || [];
    const knownCompanies = /\b(BPI|BDO|Metrobank|PLDT|Globe|Ayala|SM|Jollibee|Philippine Airlines|PAL)\b/gi;
    const knownMatches = message.match(knownCompanies) || [];
    return [...matches, ...knownMatches];
  }

  static inferFollowUpIntent(conversationState) {
    const lastExchange = conversationState.memory[conversationState.memory.length - 1];
    if (!lastExchange) return 'general_followup';

    const lastUserMessage = lastExchange.user.toLowerCase();

    if (this.isCompanySpecific(lastUserMessage)) return 'company_inquiry';
    if (this.isStrategicAdvice(lastUserMessage)) return 'strategy_advice';
    if (this.isMarketResearch(lastUserMessage)) return 'market_research';
    if (this.isCrisisInquiry(lastUserMessage)) return 'crisis_analysis';

    return 'general_followup';
  }
}

module.exports = IntentEngine; 