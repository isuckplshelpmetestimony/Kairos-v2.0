const fs = require('fs');

// Read the current CSV
const csvContent = fs.readFileSync('client/public/combined_events_all_cleaned.csv', 'utf8');
const lines = csvContent.split('\n');

// Replace the first 3 events with the specific ones requested
const newEvents = [
  'event_name,date_location,attendees,goals,source_url,primary_industry,secondary_industry,event_type,featured,company_stages',
  '"Scaling Project & Change Management for Organizational Success","Manila - 15 Aug 2025","Business leaders, Project managers","Organizational change, Project scaling","https://example.com/event/scaling","Technology","","Workshop","true","Planning Transformation"',
  '"C-Suite Circle: Exclusive Gathering of Visionary Leaders (Batch 3)","Manila - 20 Aug 2025","C-Suite executives, Visionary leaders","Leadership networking, Strategic discussions","https://example.com/event/csuite","Technology","","Meeting","true","Planning Transformation"',
  '"Fraud Detection for Business","Manila - 25 Aug 2025","Business professionals, Security experts","Fraud prevention, Business security","https://example.com/event/fraud","Technology","","Workshop","true","Planning Transformation"'
];

// Keep the header and first 3 new events, then add all the rest
const updatedLines = [...newEvents, ...lines.slice(4)];

// Write back to CSV
fs.writeFileSync('client/public/combined_events_all_cleaned.csv', updatedLines.join('\n'));

console.log('Updated first 3 events for free users'); 