import React from 'react';
import { Event } from '../lib/types';
import EventCard from './EventCard';

interface FeaturedEventsProps {
  events: Event[];
}

export default function FeaturedEvents({ events }: FeaturedEventsProps) {
  if (!events.length) {
    return <div className="text-center text-gray-500">No featured events available.</div>;
  }
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Featured Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
