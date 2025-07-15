import { Event, SearchFilters } from './types';

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

    // Company stage filter
    const matchesCompanyStage = filters.companyStage === 'All categories' ||
      event.companyStages.includes(filters.companyStage);

    return matchesQuery && matchesIndustry && matchesCompanyStage;
  });
}

export function getFeaturedEvents(events: Event[]): Event[] {
  return events.filter(event => event.featured);
} 