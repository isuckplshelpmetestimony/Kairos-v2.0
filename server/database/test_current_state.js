const { sql } = require('./connection.js');

async function testCurrentDatabaseState() {
  console.log('🔍 Testing current database state...\n');

  try {
    // Test 1: Check if crisis_chat_conversations table exists
    console.log('1. Checking if crisis_chat_conversations table exists...');
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'crisis_chat_conversations'
      );
    `;
    
    if (tableExists[0].exists) {
      console.log('✅ crisis_chat_conversations table exists');
      
      // Test 2: Check if session_id column exists
      console.log('\n2. Checking if session_id column exists...');
      const columnExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'crisis_chat_conversations' 
          AND column_name = 'session_id'
        );
      `;
      
      if (columnExists[0].exists) {
        console.log('✅ session_id column already exists');
        
        // Get column details
        const columnDetails = await sql`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            character_maximum_length
          FROM information_schema.columns 
          WHERE table_name = 'crisis_chat_conversations' 
          AND column_name = 'session_id';
        `;
        
        console.log('📋 Column details:', columnDetails[0]);
      } else {
        console.log('❌ session_id column is MISSING - this is causing the crashes!');
        console.log('🚨 This needs to be fixed with the migration.');
      }
      
      // Test 3: Check table structure
      console.log('\n3. Checking full table structure...');
      const tableStructure = await sql`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'crisis_chat_conversations'
        ORDER BY ordinal_position;
      `;
      
      console.log('📋 Table structure:');
      tableStructure.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Test 4: Check if there's any data
      console.log('\n4. Checking if table has data...');
      const dataCount = await sql`
        SELECT COUNT(*) as total_rows
        FROM crisis_chat_conversations;
      `;
      
      console.log(`📊 Total rows in table: ${dataCount[0].total_rows}`);
      
    } else {
      console.log('❌ crisis_chat_conversations table does NOT exist');
      console.log('🚨 This table needs to be created first before adding session_id column');
    }
    
    // Test 5: Check other related tables
    console.log('\n5. Checking other crisis-related tables...');
    const crisisTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE 'crisis_%'
      ORDER BY table_name;
    `;
    
    console.log('📋 Crisis-related tables found:');
    crisisTables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing database state:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testCurrentDatabaseState()
  .then(() => {
    console.log('\n✅ Database state test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }); 