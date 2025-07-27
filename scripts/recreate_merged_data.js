const fs = require('fs');

// Function to properly parse CSV with quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Function to read CSV file properly
function readCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }
  
  return data;
}

// Function to recreate merged data
function recreateMergedData() {
  console.log('🔧 Recreating merged data with correct structure...');
  
  try {
    // Read the original events data
    const originalEvents = readCSV('combined_events_all_updated_backup.csv');
    console.log(`📊 Loaded ${originalEvents.length} original events`);
    
    // Read the new conference data
    const newConferences = readCSV('all_philippine_conferences.csv');
    console.log(`📊 Loaded ${newConferences.length} new conferences`);
    
    // Combine the data
    const mergedData = [...originalEvents, ...newConferences];
    console.log(`📊 Total merged events: ${mergedData.length}`);
    
    // Write the properly formatted CSV
    const headers = [
      'event_name',
      'date_location', 
      'attendees',
      'goals',
      'source_url',
      'primary_industry',
      'secondary_industry',
      'event_type',
      'featured',
      'company_stages'
    ];
    
    const outputLines = [headers.join(',')];
    
    mergedData.forEach(event => {
      const row = [
        event.event_name,
        event.date_location,
        event.attendees,
        event.goals,
        event.source_url,
        event.primary_industry,
        event.secondary_industry || '',
        event.event_type,
        event.featured || 'false',
        event.company_stages
      ];
      
      // Escape fields that contain commas or quotes
      const escapedRow = row.map(field => {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      });
      
      outputLines.push(escapedRow.join(','));
    });
    
    // Write to the main events file
    const outputPath = 'client/public/combined_events_all_cleaned.csv';
    fs.writeFileSync(outputPath, outputLines.join('\n'), 'utf8');
    console.log(`✅ Properly formatted CSV saved to: ${outputPath}`);
    console.log(`📊 Total rows: ${outputLines.length - 1} (excluding header)`);
    
    // Test the first few rows
    console.log('\n📋 Testing first few rows:');
    for (let i = 1; i <= Math.min(3, outputLines.length - 1); i++) {
      const fields = parseCSVLine(outputLines[i]);
      console.log(`Row ${i}:`);
      console.log(`  Event: ${fields[0]}`);
      console.log(`  Industry: ${fields[5]}`);
      console.log(`  Type: ${fields[7]}`);
    }
    
    // Show industry statistics
    const industryStats = {};
    mergedData.forEach(event => {
      const industry = event.primary_industry;
      if (industry && industry.trim()) {
        industryStats[industry] = (industryStats[industry] || 0) + 1;
      }
    });
    
    console.log('\n🏭 Top Industries:');
    Object.entries(industryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([industry, count]) => {
        console.log(`  ${industry}: ${count} events`);
      });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error recreating merged data:', error);
    throw error;
  }
}

// Run the recreation
if (require.main === module) {
  recreateMergedData();
}

module.exports = { recreateMergedData }; 