import Papa from 'papaparse';
import { Event } from './types';
import { mapCompanyStageToReadiness } from './dataMapper';

function generateId(row: any, idx: number): string {
  // Use a hash of event name + date/location or fallback to index
  return `${row.event_name || ''}-${row.date_location || ''}-${idx}`.replace(/\s+/g, '-');
}

export function parseEventsCSV(csvContent: string): Event[] {
  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    // Optionally log or handle errors
    console.warn('CSV parse errors:', parsed.errors);
  }

  return (parsed.data as any[]).map((row, idx) => {
    // Validate required fields
    if (!row.event_name || !row.date_location || !row.source_url) return null;
    const companyStages = row.company_stages ? row.company_stages.split('|').map((s: string) => s.trim()) : [];
    return {
      id: generateId(row, idx),
      eventName: row.event_name.trim(),
      dateLocation: row.date_location.trim(),
      attendees: row.attendees?.trim() || '',
      goals: row.goals?.trim() || '',
      sourceUrl: row.source_url.trim(),
      primaryIndustry: row.primary_industry.trim(),
      secondaryIndustry: row.secondary_industry?.trim() || undefined,
      companyStages,
      companyReadiness: mapCompanyStageToReadiness(companyStages),
      eventType: row.event_type.trim(),
      featured: row.featured?.toLowerCase() === 'true',
    };
  }).filter(Boolean) as Event[];
} 