const fs = require('fs');

// Function to read CSV file
function readCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content;
}

// Function to merge CSV files
function mergeCSVFiles() {
  console.log('🔧 Starting simple CSV merge...');
  
  try {
    // Read existing events data
    const existingEvents = readCSV('combined_events_all_updated.csv');
    console.log(`📊 Loaded existing events file`);
    
    // Read new conference data
    const newConferences = readCSV('all_philippine_conferences.csv');
    console.log(`📊 Loaded new conferences file`);
    
    // Split into lines
    const existingLines = existingEvents.split('\n');
    const newLines = newConferences.split('\n');
    
    // Get headers from existing file
    const headers = existingLines[0];
    
    // Combine data (skip header from new file)
    const combinedLines = [
      headers,
      ...existingLines.slice(1), // Skip header from existing
      ...newLines.slice(1)       // Skip header from new
    ];
    
    // Write merged data
    const mergedContent = combinedLines.join('\n');
    const outputPath = 'combined_events_all_merged.csv';
    fs.writeFileSync(outputPath, mergedContent);
    
    console.log(`✅ Merged data saved to: ${outputPath}`);
    console.log(`📊 Total lines: ${combinedLines.length - 1} (excluding header)`);
    
    // Count events by industry
    const industryStats = {};
    const lines = mergedContent.split('\n');
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const columns = lines[i].split(',');
        if (columns.length >= 6) {
          const industry = columns[5].replace(/"/g, '').trim();
          if (industry) {
            industryStats[industry] = (industryStats[industry] || 0) + 1;
          }
        }
      }
    }
    
    console.log('\n📈 Industry Statistics:');
    Object.entries(industryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([industry, count]) => {
        console.log(`  ${industry}: ${count} events`);
      });
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ Error during merge:', error);
    throw error;
  }
}

// Run the merge
if (require.main === module) {
  mergeCSVFiles();
}

module.exports = { mergeCSVFiles }; 