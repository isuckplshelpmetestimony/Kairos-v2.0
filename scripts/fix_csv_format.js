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

// Function to read and fix CSV file
function fixCSVFormat() {
  console.log('🔧 Fixing CSV format...');
  
  try {
    const inputPath = 'client/public/combined_events_all_cleaned.csv';
    const outputPath = 'client/public/combined_events_all_cleaned_fixed.csv';
    
    const content = fs.readFileSync(inputPath, 'utf8');
    const lines = content.split('\n');
    const headers = parseCSVLine(lines[0]);
    const fixedLines = [headers.join(',')];
    
    let currentRow = [];
    let inQuotes = false;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line continues a quoted field
      if (inQuotes) {
        currentRow[currentRow.length - 1] += '\n' + line;
        if (line.includes('"')) {
          inQuotes = false;
        }
      } else {
        // Start new row
        currentRow = parseCSVLine(line);
        inQuotes = line.includes('"') && (line.match(/"/g) || []).length % 2 === 1;
      }
      
      // If we have a complete row, add it
      if (!inQuotes && currentRow.length === headers.length) {
        const escapedRow = currentRow.map(field => {
          if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        });
        fixedLines.push(escapedRow.join(','));
        currentRow = [];
      }
    }
    
    // Write fixed CSV
    fs.writeFileSync(outputPath, fixedLines.join('\n'), 'utf8');
    console.log(`✅ Fixed CSV saved to: ${outputPath}`);
    console.log(`📊 Total rows: ${fixedLines.length - 1} (excluding header)`);
    
    // Replace the original file
    fs.copyFileSync(outputPath, inputPath);
    console.log('✅ Original file updated with fixed format');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error fixing CSV format:', error);
    throw error;
  }
}

// Run the fix
if (require.main === module) {
  fixCSVFormat();
}

module.exports = { fixCSVFormat }; 