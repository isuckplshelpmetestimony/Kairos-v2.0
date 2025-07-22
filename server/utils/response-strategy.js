class ResponseStrategy {
  static selectStrategy(intent, conversationState) {
    const baseStrategy = {
      approach: 'general',
      data_needed: 'none',
      response_length: 'medium',
      prompt_style: 'professional',
      next_action: 'ask_followup',
      include_sources: false,
      include_followups: true
    };

    // Strategy selection based on intent and context
    const strategyMap = {
      'greeting': this.getGreetingStrategy(conversationState),
      'company_inquiry': this.getCompanyInquiryStrategy(intent, conversationState),
      'strategy_advice': this.getStrategyAdviceStrategy(intent, conversationState),
      'market_research': this.getMarketResearchStrategy(intent, conversationState),
      'crisis_analysis': this.getCrisisAnalysisStrategy(intent, conversationState),
      'contact_inquiry': this.getContactInquiryStrategy(intent, conversationState),
      'general_followup': this.getFollowupStrategy(conversationState)
    };

    const strategy = strategyMap[intent.primary_intent] || baseStrategy;

    // Adjust strategy based on conversation state
    if (conversationState.context.depth_preference === 'brief') {
      strategy.response_length = 'short';
      strategy.prompt_style = 'concise';
    } else if (conversationState.context.depth_preference === 'detailed') {
      strategy.response_length = 'long';
      strategy.include_sources = true;
    }

    // Adjust based on urgency
    if (intent.urgency === 'urgent') {
      strategy.approach = 'direct';
      strategy.response_length = 'medium';
      strategy.next_action = 'provide_immediate_guidance';
    }

    return strategy;
  }

  static getGreetingStrategy(conversationState) {
    if (conversationState.memory.length === 0) {
      return {
        approach: 'welcoming_new',
        data_needed: 'summary_stats',
        response_length: 'short',
        prompt_style: 'friendly',
        next_action: 'ask_about_needs',
        include_sources: false,
        include_followups: true
      };
    } else {
      return {
        approach: 'welcoming_returning',
        data_needed: 'previous_context',
        response_length: 'short',
        prompt_style: 'contextual',
        next_action: 'continue_or_new_topic',
        include_sources: false,
        include_followups: true
      };
    }
  }

  static getCompanyInquiryStrategy(intent, conversationState) {
    return {
      approach: 'analytical',
      data_needed: 'company_specific',
      response_length: intent.scope === 'specific' ? 'medium' : 'long',
      prompt_style: 'professional',
      next_action: 'offer_deeper_analysis',
      include_sources: true,
      include_followups: true,
      target_companies: intent.specific_companies
    };
  }

  static getStrategyAdviceStrategy(intent, conversationState) {
    return {
      approach: 'consultative',
      data_needed: 'market_trends',
      response_length: 'long',
      prompt_style: 'advisory',
      next_action: 'ask_clarifying_questions',
      include_sources: true,
      include_followups: true
    };
  }

  static getMarketResearchStrategy(intent, conversationState) {
    return {
      approach: 'research_oriented',
      data_needed: 'market_data',
      response_length: 'long',
      prompt_style: 'analytical',
      next_action: 'suggest_deep_dive',
      include_sources: true,
      include_followups: true
    };
  }

  static getCrisisAnalysisStrategy(intent, conversationState) {
    return {
      approach: 'crisis_focused',
      data_needed: 'crisis_companies',
      response_length: 'medium',
      prompt_style: 'urgent',
      next_action: 'provide_actionable_steps',
      include_sources: true,
      include_followups: true
    };
  }

  static getContactInquiryStrategy(intent, conversationState) {
    return {
      approach: 'contact_focused',
      data_needed: 'decision_makers',
      response_length: 'medium',
      prompt_style: 'practical',
      next_action: 'offer_contact_strategy',
      include_sources: false,
      include_followups: true
    };
  }

  static getFollowupStrategy(conversationState) {
    const lastIntent = conversationState.memory.length > 0 ?
      conversationState.memory[conversationState.memory.length - 1].user : '';

    return {
      approach: 'contextual_followup',
      data_needed: 'contextual',
      response_length: conversationState.context.depth_preference === 'brief' ? 'short' : 'medium',
      prompt_style: 'conversational',
      next_action: 'continue_conversation',
      include_sources: false,
      include_followups: true
    };
  }
}

module.exports = ResponseStrategy; 