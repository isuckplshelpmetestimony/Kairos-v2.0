import React from 'react';
import { Event } from '../lib/types';
import EventCard from './EventCard';

interface SearchResultsProps {
  events: Event[];
  isLoading?: boolean;
  hasSearched?: boolean;
  handlePremiumClick?: (eventId: string) => void;
}

export default function SearchResults({ events, isLoading, hasSearched, handlePremiumClick }: SearchResultsProps) {
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
        {events.map((event, index) => (
          <EventCard key={event.id} event={event} index={index} handlePremiumClick={handlePremiumClick} />
        ))}
      </div>
    </section>
  );
} 