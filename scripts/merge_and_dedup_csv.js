const fs = require('fs');
const Papa = require('papaparse');

const mainCsvPath = 'client/public/combined_events_all_cleaned.csv';
const newCsvPath = 'from grok.csv';
const outputCsvPath = 'client/public/combined_events_all_merged.csv';

// Read and parse both CSVs
const mainCsv = fs.readFileSync(mainCsvPath, 'utf8');
const newCsv = fs.readFileSync(newCsvPath, 'utf8');

const mainRows = Papa.parse(mainCsv, { header: true, skipEmptyLines: true }).data;
const newRows = Papa.parse(newCsv, { header: true, skipEmptyLines: true }).data;

// Merge and deduplicate by event_name
const eventMap = new Map();
[...mainRows, ...newRows].forEach(row => {
  if (row.event_name && !eventMap.has(row.event_name)) {
    eventMap.set(row.event_name, row);
  }
});

const mergedRows = Array.from(eventMap.values());

// Use the header from the main CSV
const header = Object.keys(mainRows[0]);
const csvOut = Papa.unparse(mergedRows, { columns: header });

fs.writeFileSync(outputCsvPath, csvOut, 'utf8');
console.log(`Merged CSV written to ${outputCsvPath} with ${mergedRows.length} unique events.`); 