import React from 'react';
import { Event } from '../lib/types';
import PaymentPage from './PaymentPage';

interface EventCardProps {
  event: Event;
  index?: number;
  handlePremiumClick?: (eventId: string) => void;
  blurred?: boolean;
}

const industryColors: Record<string, string> = {
  'Technology': 'badge-premium',
  'Government & Public Sector': 'badge-premium',
  'Retail & E-commerce': 'badge-premium',
  'Banking & Financial Services': 'badge-premium',
};

export default function EventCard({ event, index, handlePremiumClick, blurred }: EventCardProps) {
  const [showPayment, setShowPayment] = React.useState(false);
  
  function getReadinessBadgeStyle(readiness: string): string {
    switch (readiness) {
      case '🚨 Needs Immediate Help':
        return 'badge-premium';
      case '🔍 Exploring Solutions':
        return 'badge-premium';
      case '📋 Planning Transformation':
        return 'badge-premium';
      default:
        return 'badge-premium';
    }
  }
  
  return (
    <div className={`card-premium flex flex-col h-full relative ${blurred ? 'blurred-event' : ''}`}>
      {blurred && (
        <div className="premium-overlay" onClick={() => handlePremiumClick && handlePremiumClick(event.id)}>
          <div className="premium-badge">Premium Event</div>
          <div className="unlock-text">Click to unlock</div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white" aria-label="Event name">
          {event.eventName}
        </h3>
        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${industryColors[event.primaryIndustry] || 'badge-premium'}`}
          aria-label="Industry">
          {event.primaryIndustry}
        </span>
      </div>
      
      <div className="text-sm text-gray-300 mb-3" aria-label="Date and location">
        {event.dateLocation}
      </div>
      
      <div className="mb-3">
        <span className="block text-xs text-gray-400 mb-1">Attendees:</span>
        <span className="text-sm text-white">{event.attendees}</span>
      </div>
      
      <div className="mb-3">
        <span className="block text-xs text-gray-400 mb-1">Goals:</span>
        <span className="text-sm text-white">{event.goals}</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4" aria-label="Company readiness">
        <span className={`px-3 py-1 text-xs rounded-full ${getReadinessBadgeStyle(event.companyReadiness)}`}>
          {event.companyReadiness}
        </span>
      </div>
      
      <div className="mt-auto pt-3">
        <a
          href={event.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block gradient-text hover:underline text-sm font-medium transition-colors"
          aria-label="View event details"
        >
          View Details →
        </a>
      </div>
    </div>
  );
}
