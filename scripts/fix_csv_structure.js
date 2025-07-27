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

// Function to fix CSV structure
function fixCSVStructure() {
  console.log('🔧 Fixing CSV structure...');
  
  try {
    const inputPath = 'client/public/combined_events_all_cleaned.csv';
    const outputPath = 'client/public/combined_events_all_cleaned_fixed.csv';
    
    const content = fs.readFileSync(inputPath, 'utf8');
    const lines = content.split('\n');
    const headers = parseCSVLine(lines[0]);
    const fixedLines = [headers.join(',')];
    
    console.log(`📋 Headers: ${headers.join(', ')}`);
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const fields = parseCSVLine(lines[i]);
        
        if (fields.length >= headers.length) {
          // Ensure we have the right number of fields
          const row = fields.slice(0, headers.length);
          
          // Escape fields that contain commas or quotes
          const escapedRow = row.map(field => {
            if (field.includes(',') || field.includes('"') || field.includes('\n')) {
              return `"${field.replace(/"/g, '""')}"`;
            }
            return field;
          });
          
          fixedLines.push(escapedRow.join(','));
        } else {
          console.log(`⚠️  Skipping row ${i + 1}: insufficient fields (${fields.length}/${headers.length})`);
        }
      }
    }
    
    // Write fixed CSV
    fs.writeFileSync(outputPath, fixedLines.join('\n'), 'utf8');
    console.log(`✅ Fixed CSV saved to: ${outputPath}`);
    console.log(`📊 Total rows: ${fixedLines.length - 1} (excluding header)`);
    
    // Replace the original file
    fs.copyFileSync(outputPath, inputPath);
    console.log('✅ Original file updated with fixed structure');
    
    // Test the first few rows
    console.log('\n📋 Testing first few rows:');
    for (let i = 1; i <= Math.min(3, fixedLines.length - 1); i++) {
      const fields = parseCSVLine(fixedLines[i]);
      console.log(`Row ${i}:`);
      console.log(`  Event: ${fields[0]}`);
      console.log(`  Industry: ${fields[5]}`);
      console.log(`  Type: ${fields[7]}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error fixing CSV structure:', error);
    throw error;
  }
}

// Run the fix
if (require.main === module) {
  fixCSVStructure();
}

module.exports = { fixCSVStructure }; 