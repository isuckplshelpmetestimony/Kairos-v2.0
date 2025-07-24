require('dotenv').config();
const connection = require('./database/connection');
const sql = connection.sql;

async function addSessionIdColumn() {
  try {
    await sql`ALTER TABLE crisis_chat_conversations ADD COLUMN IF NOT EXISTS session_id VARCHAR(255)`;
    console.log('✅ Added session_id column to crisis_chat_conversations table');
  } catch (error) {
    console.error('❌ Error adding session_id column:', error);
  }
}

addSessionIdColumn(); 