import { Event, SearchFilters } from './types';

// Helper function to normalize readiness levels for comparison
function normalizeReadiness(readiness: string): string {
  const mappings: Record<string, string> = {
    '🚨 Needs Immediate Help': '🔥 Active Challenges (problems happening now)',
    'Needs Immediate Help': '🔥 Active Challenges (problems happening now)',
    '🔍 Exploring Solutions': '🔍 Exploring Solutions (aware and researching)',
    'Exploring Solutions': '🔍 Exploring Solutions (aware and researching)',
    '📋 Planning Transformation': '📋 Planning Transformation (ready to execute)',
    'Planning Transformation': '📋 Planning Transformation (ready to execute)'
  };
  return mappings[readiness] || readiness;
}

export function filterEvents(events: Event[], filters: SearchFilters): Event[] {
  return events.filter(event => {
    // Text search in event name, attendees, goals
    const matchesQuery = !filters.query || 
      event.eventName.toLowerCase().includes(filters.query.toLowerCase()) ||
      event.attendees.toLowerCase().includes(filters.query.toLowerCase()) ||
      event.goals.toLowerCase().includes(filters.query.toLowerCase());

    // Industry filter
    const matchesIndustry = filters.industry === 'All industries' || 
      event.primaryIndustry === filters.industry;

    // Company readiness filter (replaces company stage filter)
    const matchesReadiness = filters.companyStage === 'All categories' ||
      normalizeReadiness(event.companyReadiness) === filters.companyStage;

    return matchesQuery && matchesIndustry && matchesReadiness;
  });
}

export function getFeaturedEvents(events: Event[]): Event[] {
  return events.filter(event => event.featured);
} 