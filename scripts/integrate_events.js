const fs = require('fs');

// Function to read CSV file
function readCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',');
      const row = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index] ? values[index].replace(/^"|"$/g, '') : '';
      });
      data.push(row);
    }
  }
  
  return data;
}

// Function to integrate events into the system
function integrateEvents() {
  console.log('🔧 Starting event integration...');
  
  try {
    // Read the merged events data
    const mergedEvents = readCSV('combined_events_all_merged.csv');
    console.log(`📊 Loaded ${mergedEvents.length} merged events`);
    
    // Generate statistics
    const industryStats = {};
    const eventTypeStats = {};
    const companyStageStats = {};
    const featuredStats = { featured: 0, notFeatured: 0 };
    
    mergedEvents.forEach(event => {
      // Industry stats
      const industry = event.primary_industry;
      if (industry && industry.trim()) {
        industryStats[industry] = (industryStats[industry] || 0) + 1;
      }
      
      // Event type stats
      const eventType = event.event_type;
      if (eventType && eventType.trim()) {
        eventTypeStats[eventType] = (eventTypeStats[eventType] || 0) + 1;
      }
      
      // Company stage stats
      const companyStage = event.company_stages;
      if (companyStage && companyStage.trim()) {
        companyStageStats[companyStage] = (companyStageStats[companyStage] || 0) + 1;
      }
      
      // Featured stats
      if (event.featured === 'true') {
        featuredStats.featured++;
      } else {
        featuredStats.notFeatured++;
      }
    });
    
    console.log('\n📈 Integration Statistics:');
    console.log(`Total Events: ${mergedEvents.length}`);
    console.log(`Featured Events: ${featuredStats.featured}`);
    console.log(`Non-Featured Events: ${featuredStats.notFeatured}`);
    console.log(`Unique Industries: ${Object.keys(industryStats).length}`);
    console.log(`Unique Event Types: ${Object.keys(eventTypeStats).length}`);
    console.log(`Unique Company Stages: ${Object.keys(companyStageStats).length}`);
    
    console.log('\n🏭 Top Industries:');
    Object.entries(industryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([industry, count]) => {
        console.log(`  ${industry}: ${count} events`);
      });
    
    console.log('\n🎯 Company Stages:');
    Object.entries(companyStageStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([stage, count]) => {
        console.log(`  ${stage}: ${count} events`);
      });
    
    console.log('\n📅 Event Types:');
    Object.entries(eventTypeStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count} events`);
      });
    
    // Copy the merged file to replace the existing events file
    fs.copyFileSync('combined_events_all_merged.csv', 'combined_events_all_updated.csv');
    console.log('\n✅ Successfully integrated events into the system!');
    console.log('📁 Updated: combined_events_all_updated.csv');
    
    // Create a backup of the original
    fs.copyFileSync('combined_events_all_updated.csv', 'combined_events_all_updated_backup.csv');
    console.log('📁 Backup created: combined_events_all_updated_backup.csv');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error during integration:', error);
    throw error;
  }
}

// Run the integration
if (require.main === module) {
  integrateEvents();
}

module.exports = { integrateEvents }; 