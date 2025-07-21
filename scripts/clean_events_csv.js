const fs = require('fs');
const path = require('path');
const INPUT = path.join(__dirname, '../client/public/combined_events_all_merged.csv');
const OUTPUT = path.join(__dirname, '../client/public/combined_events_all_cleaned_safe.csv');

const EXPECTED_COLUMNS = [
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

function parseCSVLine(line) {
  // Basic CSV parsing: split on commas not inside quotes
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function cleanCSV(inputPath, outputPath) {
  const lines = fs.readFileSync(inputPath, 'utf8').split(/\r?\n/).filter(Boolean);
  let header = lines[0].replace(/\s+/g, '').replace(/,$/, '');
  const columns = header.split(',');
  if (columns.length !== EXPECTED_COLUMNS.length || columns.some((c, i) => c !== EXPECTED_COLUMNS[i])) {
    header = EXPECTED_COLUMNS.join(',');
    console.log('Header fixed to expected columns.');
  }
  const cleaned = [header];
  let skipped = 0;
  let fixed = 0;
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length === EXPECTED_COLUMNS.length) {
      cleaned.push(row.map(cell => cell.trim()).join(','));
    } else if (row.length > EXPECTED_COLUMNS.length) {
      cleaned.push(row.slice(0, EXPECTED_COLUMNS.length).map(cell => cell.trim()).join(','));
      fixed++;
    } else {
      skipped++;
      console.warn(`Skipped row ${i+1}: wrong number of columns (${row.length})`);
    }
  }
  fs.writeFileSync(outputPath, cleaned.join('\n'), 'utf8');
  console.log(`Done. Cleaned file written to ${outputPath}`);
  if (fixed > 0) console.log(`Fixed ${fixed} rows with too many columns.`);
  if (skipped > 0) console.log(`Skipped ${skipped} malformed rows.`);
}

cleanCSV(INPUT, OUTPUT); 