const { sql } = require('../database/connection');
const { requireAuth, requirePremium } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const IntentEngine = require('../utils/intent-engine');
const ConversationState = require('../utils/conversation-state');
const ResponseStrategy = require('../utils/response-strategy');
const ConversationOrchestrator = require('../utils/conversation-orchestrator');

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

// Test function (remove after testing)
async function testResponseStrategy() {
  const dummyState = new ConversationState(1, 'test');
  const testIntent = { primary_intent: 'company_inquiry', urgency: 'normal', information_need: 'high' };
  const strategy = ResponseStrategy.selectStrategy(testIntent, dummyState);
  console.log('Strategy for company inquiry:', strategy);
}
// Uncomment to test: testResponseStrategy();

// Test function (remove after testing)
async function testOrchestrator() {
  try {
    const result = await ConversationOrchestrator.processMessage(
      "Hello, I'm interested in Philippine banking companies",
      1,
      'test-session'
    );
    console.log('Orchestrator test result:', result);
  } catch (error) {
    console.error('Orchestrator test failed:', error);
  }
}
// Uncomment to test: testOrchestrator();

// Everything else gets replaced with the intelligent system

module.exports = router; 