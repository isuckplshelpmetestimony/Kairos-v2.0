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

  // Create the 3 specific events for free users
  const specificEvents: Event[] = [
    {
      id: 'scaling-project-change-management',
      eventName: 'Scaling Project & Change Management for Organizational Success',
      dateLocation: 'Manila - 15 Aug 2025',
      attendees: 'Project managers, Change leaders, Executives',
      goals: 'Organizational transformation, Project scaling, Change management',
      sourceUrl: 'https://example.com/scaling-project',
      primaryIndustry: 'Technology',
      secondaryIndustry: 'Manufacturing',
      companyStages: ['Planning Transformation'],
      companyReadiness: '📋 Planning Transformation (ready to execute)',
      eventType: 'Workshop',
      featured: true
    },
    {
      id: 'c-suite-circle-batch-3',
      eventName: 'C-Suite Circle: Exclusive Gathering of Visionary Leaders (Batch 3)',
      dateLocation: 'Manila - 20 Aug 2025',
      attendees: 'C-Suite executives, Visionary leaders, CEOs',
      goals: 'Leadership networking, Strategic insights, Executive collaboration',
      sourceUrl: 'https://example.com/c-suite-circle',
      primaryIndustry: 'Technology',
      secondaryIndustry: 'Banking & Financial Services',
      companyStages: ['Planning Transformation'],
      companyReadiness: '📋 Planning Transformation (ready to execute)',
      eventType: 'Meeting',
      featured: true
    },
    {
      id: 'fraud-detection-business',
      eventName: 'Fraud Detection for Business',
      dateLocation: 'Manila - 25 Aug 2025',
      attendees: 'Security professionals, Business leaders, Risk managers',
      goals: 'Fraud prevention, Security awareness, Risk management',
      sourceUrl: 'https://example.com/fraud-detection',
      primaryIndustry: 'Banking & Financial Services',
      secondaryIndustry: 'Technology',
      companyStages: ['Active Challenges'],
      companyReadiness: '🔥 Active Challenges (problems happening now)',
      eventType: 'Workshop',
      featured: true
    }
  ];

  // For free users, show the 3 specific events first, then the rest blurred
  const displayEvents = hasAccess ? events : [...specificEvents, ...events];

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Featured Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayEvents.map((event, index) => (
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
