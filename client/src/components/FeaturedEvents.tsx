import React from 'react';
import { Event } from '../lib/types';
import EventCard from './EventCard';
import { useAuth } from '../contexts/AuthContext';

interface FeaturedEventsProps {
  events: Event[];
  setShowPaymentModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function FeaturedEvents({ events, setShowPaymentModal }: FeaturedEventsProps) {
  const { isPremium } = useAuth();
  const hasAccess = isPremium();

  function handlePremiumClick(eventId: string) {
    setShowPaymentModal(true);
  }

  if (!events.length) {
    return <div className="text-center text-gray-500">No featured events available.</div>;
  }
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Featured Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <EventCard
            key={event.id}
            event={event}
            index={index}
            handlePremiumClick={handlePremiumClick}
            blurred={index >= 3 && !hasAccess}
          />
        ))}
      </div>
    </section>
  );
}
