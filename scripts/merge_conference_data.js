const fs = require('fs');
const path = require('path');

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

// Function to merge the datasets
function mergeDatasets() {
  console.log('🔧 Starting data merge process...');
  
  try {
    // Read existing events data
    const existingEvents = readCSV('combined_events_all_updated.csv');
    console.log(`📊 Loaded ${existingEvents.length} existing events`);
    
    // Read new conference data
    const newConferences = readCSV('all_philippine_conferences.csv');
    console.log(`📊 Loaded ${newConferences.length} new conferences`);
    
    // Read company crisis data (for reference)
    const companyData = readCSV('merged_philippine_companies_crisis_dataset.csv');
    console.log(`📊 Loaded ${companyData.length} company records for reference`);
    
    // Transform new conferences to match existing event format
    const transformedConferences = newConferences.map(conference => {
      // Map company_stages to match existing format
      let companyStage = 'Exploring Solutions';
      if (conference.company_stages === 'Needs Immediate Help') {
        companyStage = 'Needs Immediate Help';
      } else if (conference.company_stages === 'Planning Transformation') {
        companyStage = 'Planning Transformation';
      }
      
      return {
        event_name: conference.event_name,
        date_location: conference.date_location,
        attendees: conference.attendees,
        goals: conference.goals,
        source_url: conference.source_url,
        primary_industry: conference.primary_industry,
        secondary_industry: conference.secondary_industry || '',
        event_type: conference.event_type || 'Conference',
        featured: conference.featured || 'false',
        company_stages: companyStage
      };
    });
    
    // Merge datasets
    const mergedData = [...existingEvents, ...transformedConferences];
    console.log(`📊 Total merged events: ${mergedData.length}`);
    
    // Write merged data to new file
    const outputPath = 'combined_events_all_merged.csv';
    writeCSV(mergedData, outputPath);
    console.log(`✅ Merged data saved to: ${outputPath}`);
    
    // Generate statistics
    const industryStats = {};
    const eventTypeStats = {};
    const companyStageStats = {};
    
    mergedData.forEach(event => {
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
    });
    
    console.log('\n📈 Merge Statistics:');
    console.log('Total Events:', mergedData.length);
    console.log('Unique Industries:', Object.keys(industryStats).length);
    console.log('Unique Event Types:', Object.keys(eventTypeStats).length);
    console.log('Unique Company Stages:', Object.keys(companyStageStats).length);
    
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
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ Error during merge:', error);
    throw error;
  }
}

// Run the merge
if (require.main === module) {
  mergeDatasets();
}

module.exports = { mergeDatasets }; 