const { sql } = require('../database/connection');
const { requireAuth, requirePremium } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const IntentEngine = require('../utils/intent-engine');
const ConversationState = require('../utils/conversation-state');

// Test function (remove after testing)
async function testIntentEngine() {
  const dummyState = new ConversationState(1, 'test');
  const testCases = [
    "Hello",
    "Tell me about BPI Bank",
    "Which companies are struggling?",
    "How should I enter the Philippine market?",
    "What are the latest trends in banking?"
  ];

  for (const testCase of testCases) {
    const intent = await IntentEngine.analyzeIntent(testCase, dummyState);
    console.log(`"${testCase}" -> ${intent.primary_intent} (${intent.information_need} need)`);
  }
}
// Uncomment this line temporarily to test: testIntentEngine();

// Everything else gets replaced with the intelligent system

module.exports = router; 