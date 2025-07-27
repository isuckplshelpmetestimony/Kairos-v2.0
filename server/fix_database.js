require('dotenv').config();

const connection = require('./database/connection');
const sql = connection.sql;

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database schema...');
    
    // 1. Add session_id column to crisis_chat_conversations
    await sql`ALTER TABLE crisis_chat_conversations ADD COLUMN IF NOT EXISTS session_id VARCHAR(255)`;
    console.log('✅ Added session_id column to crisis_chat_conversations');
    
    // 2. Add is_active column to crisis_companies
    await sql`ALTER TABLE crisis_companies ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`;
    console.log('✅ Added is_active column to crisis_companies');
    
    // 3. Update existing records to have is_active = true
    await sql`UPDATE crisis_companies SET is_active = true WHERE is_active IS NULL`;
    console.log('✅ Updated existing companies to be active');
    
    console.log('🎉 Database schema fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  }
}

fixDatabase(); 