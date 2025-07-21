import sql from '../database/connection.js';
import { requireAuth, requirePremium } from '../middleware/auth.js';
import express from 'express';
const router = express.Router();

// POST /api/crisis/chat/:companyId
router.post('/chat/:companyId', requireAuth, requirePremium, async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    const { message, context_preferences = {} } = req.body;
    const userId = req.user.userId;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Verify company exists
    const companyCheck = await sql(
      'SELECT id FROM crisis_companies WHERE id = $1 AND is_active = true',
      [companyId]
    );

    if (companyCheck.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const startTime = Date.now();

    // Build AI context from company data
    const aiContext = await buildCompanyIntelligenceContext(companyId, context_preferences);

    // Save user message
    await sql(
      `INSERT INTO crisis_chat_conversations
       (company_id, user_id, message_content, message_type)
       VALUES ($1, $2, $3, $4)`,
      [companyId, userId, message, 'user_question']
    );

    // Generate AI response (placeholder for now)
    const aiResponse = await generateAIResponse(message, aiContext);
    const responseTime = Date.now() - startTime;

    // Save AI response
    const aiMessageResult = await sql(
      `INSERT INTO crisis_chat_conversations
       (company_id, user_id, message_content, message_type, ai_context_used, response_time_ms)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [companyId, userId, aiResponse.response, 'ai_response', JSON.stringify(aiContext), responseTime]
    );

    res.json({
      ai_response: aiResponse.response,
      context_sources: aiResponse.sources,
      confidence_level: aiResponse.confidence,
      suggested_followups: aiResponse.followups,
      response_time_ms: responseTime,
      conversation_id: aiMessageResult[0].id
    });

  } catch (error) {
    console.error('Error in crisis chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Helper function to build AI context
async function buildCompanyIntelligenceContext(companyId, preferences) {
  try {
    // Get company basic info
    const company = await sql(
      'SELECT * FROM crisis_companies WHERE id = $1',
      [companyId]
    );

    // Get relevant signals based on preferences
    let signalTypes = [];
    if (preferences.include_financial_signals !== false) {
      signalTypes.push('financial_distress', 'layoffs', 'budget_cuts');
    }
    if (preferences.include_behavioral_indicators !== false) {
      signalTypes.push('event_attendance', 'vendor_evaluation', 'solution_research');
    }
    if (preferences.include_market_triggers !== false) {
      signalTypes.push('regulatory_change', 'competitor_threat', 'market_disruption');
    }

    const signals = await sql(
      `SELECT * FROM crisis_signals
       WHERE company_id = $1
       AND ($2::text[] IS NULL OR signal_type = ANY($2))
       ORDER BY temporal_relevance DESC, confidence_score DESC
       LIMIT 10`,
      [companyId, signalTypes.length > 0 ? signalTypes : null]
    );

    // Get decision makers
    const decisionMakers = await sql(
      `SELECT full_name, job_title, seniority_level, decision_authority_level
       FROM company_decision_makers
       WHERE company_id = $1
       ORDER BY decision_authority_level DESC
       LIMIT 5`,
      [companyId]
    );

    return {
      company: company[0],
      signals,
      decision_makers: decisionMakers,
      context_timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error building AI context:', error);
    return null;
  }
}

// Placeholder AI response function
async function generateAIResponse(message, context) {
  // TODO: Integrate with OpenAI API using company context
  return {
    response: `Based on the crisis intelligence for ${context?.company?.company_name}, I can help you understand their current transformation situation. They have a crisis score of ${context?.company?.crisis_score}/10 and are in the "${context?.company?.crisis_category}" category.`,
    sources: ['company_signals', 'decision_makers'],
    confidence: 0.85,
    followups: [
      "What specific transformation challenges are they facing?",
      "Who are the key decision makers I should contact?",
      "What's their timeline for making decisions?"
    ]
  };
}

export default router; 