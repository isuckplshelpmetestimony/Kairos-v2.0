// Global test teardown - runs once after all tests
module.exports = async () => {
  console.log('🧹 Starting global test teardown...');
  
  // Clean up any remaining test data
  try {
    const { sql } = require('../database/connection.js');
    
    // Clean up test users
    await sql`DELETE FROM users WHERE email LIKE 'test-%'`;
    
    // Clean up test chat conversations
    await sql`DELETE FROM crisis_chat_conversations WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test-%')`;
    
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Test teardown error:', error);
  }
  
  console.log('✅ Global test teardown completed');
}; 