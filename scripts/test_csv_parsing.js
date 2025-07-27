const fs = require('fs');

// Function to test CSV parsing
function testCSVParsing() {
  console.log('🧪 Testing CSV parsing...');
  
  try {
    const csvContent = fs.readFileSync('client/public/combined_events_all_cleaned.csv', 'utf8');
    console.log(`📄 File size: ${csvContent.length} characters`);
    
    // Test basic parsing
    const lines = csvContent.split('\n');
    console.log(`📊 Total lines: ${lines.length}`);
    console.log(`📋 Header: ${lines[0]}`);
    
    // Check first few data lines
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      if (lines[i].trim()) {
        const fields = lines[i].split(',');
        console.log(`Row ${i}: ${fields.length} fields`);
        console.log(`  Event name: ${fields[0]}`);
        console.log(`  Industry: ${fields[5] || 'N/A'}`);
      }
    }
    
    // Test with Papa Parse (if available)
    try {
      const Papa = require('papaparse');
      const parsed = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
      });
      
      console.log(`✅ Papa Parse successful: ${parsed.data.length} rows`);
      if (parsed.errors.length > 0) {
        console.log(`⚠️  Parse errors: ${parsed.errors.length}`);
        parsed.errors.slice(0, 3).forEach(error => {
          console.log(`  - Row ${error.row}: ${error.message}`);
        });
      }
      
      // Show sample data
      if (parsed.data.length > 0) {
        console.log('\n📋 Sample parsed data:');
        const sample = parsed.data[0];
        console.log(`  Event name: ${sample.event_name}`);
        console.log(`  Industry: ${sample.primary_industry}`);
        console.log(`  Event type: ${sample.event_type}`);
      }
      
    } catch (papaError) {
      console.log('⚠️  Papa Parse not available, using basic parsing');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error testing CSV parsing:', error);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testCSVParsing();
}

module.exports = { testCSVParsing }; 