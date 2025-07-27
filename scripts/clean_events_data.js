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

// Function to write CSV file
function writeCSV(data, filePath) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        return value.includes(',') ? `"${value}"` : value;
      }).join(',')
    )
  ].join('\n');
  
  fs.writeFileSync(filePath, csvContent);
}

// Function to clean events data
function cleanEventsData() {
  console.log('🔧 Starting data cleaning...');
  
  try {
    // Read the merged events data
    const events = readCSV('combined_events_all_updated.csv');
    console.log(`📊 Loaded ${events.length} events`);
    
    // Clean and fix the data
    const cleanedEvents = events.map(event => {
      // Fix company_stages field
      let companyStage = event.company_stages;
      
      // If company_stages contains URLs or invalid data, set to default
      if (companyStage && (
        companyStage.includes('http') || 
        companyStage.includes('www') ||
        companyStage.includes('conferencealert.com') ||
        companyStage.length > 50
      )) {
        companyStage = 'Exploring Solutions';
      }
      
      // Map specific company stages
      if (companyStage === 'Needs Immediate Help') {
        companyStage = 'Needs Immediate Help';
      } else if (companyStage === 'Planning Transformation') {
        companyStage = 'Planning Transformation';
      } else if (!companyStage || companyStage.trim() === '') {
        companyStage = 'Exploring Solutions';
      }
      
      return {
        ...event,
        company_stages: companyStage
      };
    });
    
    console.log(`📊 Cleaned ${cleanedEvents.length} events`);
    
    // Generate statistics
    const industryStats = {};
    const eventTypeStats = {};
    const companyStageStats = {};
    const featuredStats = { featured: 0, notFeatured: 0 };
    
    cleanedEvents.forEach(event => {
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
    
    console.log('\n📈 Cleaned Data Statistics:');
    console.log(`Total Events: ${cleanedEvents.length}`);
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
    
    // Write cleaned data
    writeCSV(cleanedEvents, 'combined_events_all_updated.csv');
    console.log('\n✅ Successfully cleaned and updated events data!');
    console.log('📁 Updated: combined_events_all_updated.csv');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error during cleaning:', error);
    throw error;
  }
}

// Run the cleaning
if (require.main === module) {
  cleanEventsData();
}

module.exports = { cleanEventsData }; 