const fs = require('fs');
const path = require('path');
const INPUT = path.join(__dirname, '../merged_philippine_companies_crisis_dataset.csv');
const OUTPUT = path.join(__dirname, '../client/public/companies_as_events.csv');

const EVENT_HEADERS = [
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

function toEventRow(company) {
  return [
    company.company_name || '',
    company.headquarters_location || '',
    (company.decision_maker_name && company.decision_maker_title) ? `${company.decision_maker_name} (${company.decision_maker_title})` : '',
    company.primary_crisis_signals || '',
    company.company_domain ? `https://${company.company_domain}` : '',
    company.industry_sector || '',
    '', // secondary_industry (not available)
    company.crisis_category || '',
    'false', // featured (default to false)
    company.crisis_category || '' // company_stages (reuse crisis_category for now)
  ];
}

function convertCSV(inputPath, outputPath) {
  const lines = fs.readFileSync(inputPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(',');
  const dataLines = lines.slice(1);
  const companies = dataLines.map(line => {
    const row = parseCSVLine(line);
    const company = {};
    header.forEach((col, idx) => {
      company[col.trim()] = row[idx] ? row[idx].replace(/^"|"$/g, '') : '';
    });
    return company;
  });
  const outLines = [EVENT_HEADERS.join(',')];
  companies.forEach(company => {
    outLines.push(toEventRow(company).map(cell => `"${cell.replace(/"/g, '""')}"`).join(','));
  });
  fs.writeFileSync(outputPath, outLines.join('\n'), 'utf8');
  console.log(`Done. Converted file written to ${outputPath}`);
}

convertCSV(INPUT, OUTPUT); 