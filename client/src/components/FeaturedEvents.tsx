import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import EventCard from './EventCard';
import { Event } from '../lib/types';
import { config } from '../config';

interface FeaturedEventsProps {
  events: Event[];
  setShowPaymentModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function FeaturedEvents({ events, setShowPaymentModal }: FeaturedEventsProps) {
  const { isPremium } = useAuth();
  const hasAccess = isPremium() || config.DISABLE_PREMIUM_REQUIREMENTS;

  function handlePremiumClick(eventId: string) {
    // If premium requirements are disabled, allow all users to access events
    if (config.DISABLE_PREMIUM_REQUIREMENTS) {
      console.log('Event access granted (premium requirements disabled)');
      return;
    }
    setShowPaymentModal(true);
  }

  if (!events.length) {
    return <div className="text-center text-white/60 text-lg">No featured events available.</div>;
  }
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Featured Events</h2>
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
