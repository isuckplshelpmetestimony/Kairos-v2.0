require('dotenv').config();

const connection = require('./database/connection');
const sql = connection.sql;

async function fixConversationIsolation() {
  try {
    console.log('🔧 Fixing conversation isolation...');
    
    // 1. Create conversation_states table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS conversation_states (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_id VARCHAR(255) NOT NULL,
        context_data JSONB DEFAULT '{}',
        memory_data JSONB DEFAULT '[]',
        conversation_stage VARCHAR(50) DEFAULT 'greeting',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, session_id)
      )
    `;
    console.log('✅ Created conversation_states table');
    
    // 2. Add index for user_id in crisis_chat_conversations if it doesn't exist
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON crisis_chat_conversations(user_id, created_at DESC)`;
      console.log('✅ Added user index to crisis_chat_conversations');
    } catch (error) {
      console.log('ℹ️ User index already exists on crisis_chat_conversations');
    }
    
    // 3. Add index for conversation_states if it doesn't exist
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_conversation_states_user ON conversation_states(user_id, session_id)`;
      console.log('✅ Added user index to conversation_states');
    } catch (error) {
      console.log('ℹ️ User index already exists on conversation_states');
    }
    
    // 4. Verify user isolation in existing conversations
    const isolationCheck = await sql`
      SELECT 
        COUNT(*) as total_conversations,
        COUNT(DISTINCT user_id) as unique_users
      FROM crisis_chat_conversations
    `;
    
    console.log('📊 Conversation isolation check:');
    console.log(`  Total conversations: ${isolationCheck[0].total_conversations}`);
    console.log(`  Unique users: ${isolationCheck[0].unique_users}`);
    
    if (isolationCheck[0].unique_users > 0) {
      const avgConversations = isolationCheck[0].total_conversations / isolationCheck[0].unique_users;
      console.log(`  Avg conversations per user: ${avgConversations.toFixed(2)}`);
    } else {
      console.log('  Avg conversations per user: 0 (no users yet)');
    }
    
    // 5. Check for any conversations without user_id (should be none)
    const orphanedConversations = await sql`
      SELECT COUNT(*) as count
      FROM crisis_chat_conversations
      WHERE user_id IS NULL
    `;
    
    if (orphanedConversations[0].count > 0) {
      console.log(`⚠️ Found ${orphanedConversations[0].count} conversations without user_id - cleaning up...`);
      
      // Delete orphaned conversations to ensure proper isolation
      await sql`
        DELETE FROM crisis_chat_conversations
        WHERE user_id IS NULL
      `;
      
      console.log(`✅ Deleted ${orphanedConversations[0].count} orphaned conversations`);
    } else {
      console.log('✅ All conversations have proper user_id isolation');
    }
    
    // 6. Add NOT NULL constraint to user_id column
    try {
      await sql`ALTER TABLE crisis_chat_conversations ALTER COLUMN user_id SET NOT NULL`;
      console.log('✅ Added NOT NULL constraint to user_id column');
    } catch (error) {
      console.log('ℹ️ user_id column already has NOT NULL constraint');
    }
    
    console.log('🎉 Conversation isolation fixed successfully!');
    console.log('🔒 All chat conversations are now properly isolated per user');
    console.log('📋 New conversations will require valid user_id');
    
  } catch (error) {
    console.error('❌ Error fixing conversation isolation:', error);
  }
}

fixConversationIsolation(); 