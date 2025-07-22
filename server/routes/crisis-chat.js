const { sql } = require('../database/connection');
const { requireAuth, requirePremium } = require('../middleware/auth');
const ConversationOrchestrator = require('../utils/conversation-orchestrator');
const express = require('express');

const router = express.Router();

// POST /api/crisis/chat - Intelligent conversation endpoint
router.post('/chat', requireAuth, requirePremium, async (req, res) => {
  try {
    const { message, session_id } = req.body;
    const userId = req.user.id;
    const sessionId = session_id || `session_${Date.now()}`;

    console.log(`Chat request from user ${userId}: "${message.substring(0, 50)}..."`);

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Process message through intelligent conversation system
    const result = await ConversationOrchestrator.processMessage(
      message.trim(),
      userId,
      sessionId
    );

    // Save conversation to database for records
    await saveChatConversation(userId, message, result.response, sessionId);

    res.json({
      ai_response: result.response,
      suggested_followups: result.followUps,
      conversation_stage: result.conversationStage,
      intent_detected: result.intent,
      response_time_ms: Date.now() - (req.startTime || Date.now()),
      session_id: sessionId
    });

  } catch (error) {
    console.error('Intelligent chat error:', error);

    // Provide helpful error message
    const errorMessage = error.message || 'I encountered an issue processing your request. Please try again or rephrase your question.';

    res.status(500).json({
      error: errorMessage,
      session_id: req.body.session_id || `session_${Date.now()}`
    });
  }
});

// GET /api/crisis/chat/history - Get conversation history
router.get('/chat/history', requireAuth, requirePremium, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, session_id } = req.query;

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

    res.json({
      conversations: conversations.reverse(),
      total: conversations.length
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Helper function to save chat conversations
async function saveChatConversation(userId, userMessage, aiResponse, sessionId) {
  try {
    // Save user message
    await sql(
      `INSERT INTO crisis_chat_conversations
       (company_id, user_id, message_content, message_type, session_id)
       VALUES (NULL, $1, $2, $3, $4)`,
      [userId, userMessage, 'user_question', sessionId]
    );

    // Save AI response
    await sql(
      `INSERT INTO crisis_chat_conversations
       (company_id, user_id, message_content, message_type, session_id)
       VALUES (NULL, $1, $2, $3, $4)`,
      [userId, aiResponse, 'ai_response', sessionId]
    );

  } catch (error) {
    console.error('Failed to save chat conversation:', error);
    // Don't throw error - this shouldn't break the conversation
  }
}

module.exports = router; 