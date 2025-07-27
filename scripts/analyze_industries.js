const fs = require('fs');
const path = require('path');

// Define all industries from the SearchSection component
const allIndustries = [
  'Technology',
  'Government & Public Sector',
  'Retail & E-commerce',
  'Banking & Financial Services',
  'Healthcare',
  'Agriculture',
  'Logistics & Supply Chain',
  'Manufacturing',
  'Education',
  'Real Estate & Construction',
  'Transportation',
  'Utilities',
  'Tourism',
];

function analyzeIndustries() {
  try {
    // Read the CSV file
    const csvPath = path.join(__dirname, '../client/public/combined_events_all_cleaned.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV (simple parsing for this analysis)
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    // Find the primary_industry column index
    const primaryIndustryIndex = headers.findIndex(header => header === 'primary_industry');
    const secondaryIndustryIndex = headers.findIndex(header => header === 'secondary_industry');
    
    if (primaryIndustryIndex === -1) {
      console.error('❌ Primary industry column not found in CSV');
      return;
    }
    
    // Track industries found in events
    const foundIndustries = new Set();
    const industryEventCounts = {};
    
    // Initialize counts
    allIndustries.forEach(industry => {
      industryEventCounts[industry] = 0;
    });
    
    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple CSV parsing (handles quoted fields)
      const fields = parseCSVLine(line);
      
      if (fields.length > primaryIndustryIndex) {
        const primaryIndustry = fields[primaryIndustryIndex]?.trim();
        const secondaryIndustry = fields[secondaryIndustryIndex]?.trim();
        
        if (primaryIndustry && primaryIndustry !== '') {
          foundIndustries.add(primaryIndustry);
          if (industryEventCounts[primaryIndustry] !== undefined) {
            industryEventCounts[primaryIndustry]++;
          }
        }
        
        if (secondaryIndustry && secondaryIndustry !== '') {
          foundIndustries.add(secondaryIndustry);
          if (industryEventCounts[secondaryIndustry] !== undefined) {
            industryEventCounts[secondaryIndustry]++;
          }
        }
      }
    }
    
    // Find missing industries
    const missingIndustries = allIndustries.filter(industry => 
      !foundIndustries.has(industry) || industryEventCounts[industry] === 0
    );
    
    // Generate report
    console.log('📊 INDUSTRY ANALYSIS REPORT');
    console.log('============================\n');
    
    console.log('🏭 ALL DEFINED INDUSTRIES:');
    allIndustries.forEach((industry, index) => {
      const count = industryEventCounts[industry] || 0;
      const status = count > 0 ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${industry} (${count} events)`);
    });
    
    console.log('\n❌ MISSING INDUSTRIES (No Events):');
    if (missingIndustries.length === 0) {
      console.log('🎉 All industries have events!');
    } else {
      missingIndustries.forEach((industry, index) => {
        console.log(`${index + 1}. ${industry}`);
      });
    }
    
    console.log('\n📈 INDUSTRY EVENT COUNTS:');
    const sortedIndustries = Object.entries(industryEventCounts)
      .sort(([,a], [,b]) => b - a);
    
    sortedIndustries.forEach(([industry, count]) => {
      console.log(`${industry}: ${count} events`);
    });
    
    console.log('\n🔍 ADDITIONAL INDUSTRIES FOUND IN DATA:');
    const additionalIndustries = Array.from(foundIndustries)
      .filter(industry => !allIndustries.includes(industry))
      .sort();
    
    if (additionalIndustries.length === 0) {
      console.log('No additional industries found.');
    } else {
      additionalIndustries.forEach(industry => {
        console.log(`- ${industry}`);
      });
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`- Total defined industries: ${allIndustries.length}`);
    console.log(`- Industries with events: ${allIndustries.length - missingIndustries.length}`);
    console.log(`- Industries missing events: ${missingIndustries.length}`);
    console.log(`- Total events analyzed: ${lines.length - 1}`);
    
  } catch (error) {
    console.error('❌ Error analyzing industries:', error);
  }
}

// Simple CSV line parser
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  fields.push(current);
  return fields;
}

// Run the analysis
analyzeIndustries(); 