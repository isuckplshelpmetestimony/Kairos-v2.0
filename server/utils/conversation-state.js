const { sql } = require('../database/connection');

class ConversationState {
  constructor(userId, sessionId) {
    this.userId = userId;
    this.sessionId = sessionId;
    this.context = {
      topic: null,
      intent: null,
      depth_preference: 'medium',
      companies_mentioned: [],
      user_role: null,
      conversation_stage: 'greeting',
      response_count: 0
    };
    this.memory = [];
  }

  static async load(userId, sessionId) {
    try {
      const result = await sql(
        'SELECT context_data, memory_data, conversation_stage FROM conversation_states WHERE user_id = $1 AND session_id = $2',
        [userId, sessionId]
      );

      const state = new ConversationState(userId, sessionId);

      if (result.length > 0) {
        state.context = { ...state.context, ...result[0].context_data };
        state.memory = result[0].memory_data || [];
        state.context.conversation_stage = result[0].conversation_stage;
      }

      return state;
    } catch (error) {
      console.error('Error loading conversation state:', error);
      return new ConversationState(userId, sessionId);
    }
  }

  async save() {
    try {
      await sql(
        `INSERT INTO conversation_states (user_id, session_id, context_data, memory_data, conversation_stage, last_updated)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (user_id, session_id)
         DO UPDATE SET
           context_data = $3,
           memory_data = $4,
           conversation_stage = $5,
           last_updated = NOW()`,
        [
          this.userId,
          this.sessionId,
          JSON.stringify(this.context),
          JSON.stringify(this.memory),
          this.context.conversation_stage
        ]
      );
    } catch (error) {
      console.error('Error saving conversation state:', error);
    }
  }

  updateContext(userMessage, aiResponse) {
    // Add to memory (keep last 6 exchanges)
    this.memory.push({
      user: userMessage,
      ai: aiResponse,
      timestamp: Date.now()
    });

    if (this.memory.length > 6) {
      this.memory = this.memory.slice(-6);
    }

    // Update context
    this.context.response_count++;

    // Infer companies mentioned
    const companyPattern = /\b([A-Z][a-zA-Z\s]+(?:Corp|Inc|Bank|Group|Company|Airlines|Corp\.))\b/g;
    const mentionedCompanies = userMessage.match(companyPattern) || [];
    mentionedCompanies.forEach(company => {
      if (!this.context.companies_mentioned.includes(company)) {
        this.context.companies_mentioned.push(company);
      }
    });

    // Update conversation stage
    if (this.context.response_count === 1) {
      this.context.conversation_stage = 'exploring';
    } else if (this.context.response_count >= 3) {
      this.context.conversation_stage = 'deep_conversation';
    }

    // Infer depth preference
    if (userMessage.length < 20 && this.context.response_count > 1) {
      this.context.depth_preference = 'brief';
    } else if (userMessage.includes('details') || userMessage.includes('analyze') || userMessage.includes('explain')) {
      this.context.depth_preference = 'detailed';
    }
  }

  getRecentTopics() {
    return this.memory.slice(-3).map(exchange => exchange.user);
  }

  isFollowUp(message) {
    const followUpIndicators = /^(and|also|what about|how about|tell me more|continue|yes|no|ok)/i;
    return followUpIndicators.test(message.trim()) && this.memory.length > 0;
  }

  hasDiscussedCompany(companyName) {
    return this.context.companies_mentioned.some(mentioned =>
      mentioned.toLowerCase().includes(companyName.toLowerCase())
    );
  }
}

module.exports = ConversationState; 