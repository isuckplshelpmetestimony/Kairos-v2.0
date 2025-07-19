import React from 'react';
import { Event } from '../lib/types';
import EventCard from './EventCard';
import { useAuth } from '../contexts/AuthContext';

interface SearchResultsProps {
  events: Event[];
  isLoading?: boolean;
  hasSearched?: boolean;
  handlePremiumClick?: (eventId: string) => void;
  searchFilters?: {
    industry: string;
    companyStage: string;
  };
}

export default function SearchResults({ 
  events, 
  isLoading, 
  hasSearched, 
  handlePremiumClick,
  searchFilters 
}: SearchResultsProps) {
  const { isPremium } = useAuth();
  const hasAccess = isPremium();

  // Determine if filters are set to "All" (default state)
  const isDefaultState = searchFilters && 
    searchFilters.industry === 'All industries' && 
    searchFilters.companyStage === 'All categories';

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading events...</div>;
  }
  if (hasSearched && events.length === 0) {
    return <div className="text-center text-gray-500">No events found.</div>;
  }
  return (
    <section className="mb-8">
      {hasSearched && (
        <div className="mb-2 text-sm text-gray-600">{events.length} events found</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => {
          // Determine if this event should be blurred
          let shouldBlur = false;
          
          if (!hasAccess) {
            if (isDefaultState) {
              // Default state: blur events after index 2 (show first 3)
              shouldBlur = index >= 3;
            } else {
              // Filtered state: blur events after index 0 (show only first 1)
              shouldBlur = index >= 1;
            }
          }
          
          return (
            <EventCard 
              key={event.id} 
              event={event} 
              index={index} 
              handlePremiumClick={handlePremiumClick}
              blurred={shouldBlur}
            />
          );
        })}
      </div>
    </section>
  );
} 