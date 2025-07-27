const fs = require('fs');
const path = require('path');

// Function to parse CSV line with quoted fields
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

// Function to update industry categorization for Real Estate events
function updateRealEstateIndustry() {
    const csvPath = path.join(__dirname, '../client/public/combined_events_all_cleaned.csv');
    
    try {
        // Read the CSV file
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.split('\n');
        
        let updatedCount = 0;
        const updatedLines = lines.map(line => {
            // Check if this line contains the Real Estate Management and Valuation event
            if (line.includes('International Conference on Real Estate Management and Valuation (ICRMV)')) {
                // Parse the CSV line properly
                const parts = parseCSVLine(line);
                
                // The industry field is the 6th field (index 5) in the CSV
                if (parts.length >= 6 && parts[5] === 'Government & Public Sector') {
                    parts[5] = 'Real Estate & Construction';
                    updatedCount++;
                    console.log(`Updated: ${parts[0]}`);
                    
                    // Reconstruct the line with proper quoting
                    return parts.map((part, index) => {
                        if (part.includes(',') || part.includes('"') || part.includes('\n')) {
                            return `"${part.replace(/"/g, '""')}"`;
                        }
                        return part;
                    }).join(',');
                }
            }
            return line;
        });
        
        // Write the updated content back to the file
        fs.writeFileSync(csvPath, updatedLines.join('\n'));
        
        console.log(`\n✅ Successfully updated ${updatedCount} Real Estate Management and Valuation events`);
        console.log(`📁 Updated file: ${csvPath}`);
        
        // Also update the backup file
        const backupPath = path.join(__dirname, '../client/public/combined_events_all_cleaned_fixed.csv');
        if (fs.existsSync(backupPath)) {
            const backupContent = fs.readFileSync(backupPath, 'utf8');
            const backupLines = backupContent.split('\n');
            
            let backupUpdatedCount = 0;
            const updatedBackupLines = backupLines.map(line => {
                if (line.includes('International Conference on Real Estate Management and Valuation (ICRMV)')) {
                    const parts = parseCSVLine(line);
                    if (parts.length >= 6 && parts[5] === 'Government & Public Sector') {
                        parts[5] = 'Real Estate & Construction';
                        backupUpdatedCount++;
                        
                        return parts.map((part, index) => {
                            if (part.includes(',') || part.includes('"') || part.includes('\n')) {
                                return `"${part.replace(/"/g, '""')}"`;
                            }
                            return part;
                        }).join(',');
                    }
                }
                return line;
            });
            
            fs.writeFileSync(backupPath, updatedBackupLines.join('\n'));
            console.log(`✅ Also updated ${backupUpdatedCount} events in backup file`);
        }
        
    } catch (error) {
        console.error('❌ Error updating Real Estate industry:', error);
    }
}

// Run the update
updateRealEstateIndustry(); 