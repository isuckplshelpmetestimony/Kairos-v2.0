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
  'Technology': 'bg-blue-900/50 text-blue-300 border-blue-500/30',
  'Government & Public Sector': 'bg-green-900/50 text-green-300 border-green-500/30',
  'Retail & E-commerce': 'bg-orange-900/50 text-orange-300 border-orange-500/30',
  'Banking & Financial Services': 'bg-purple-900/50 text-purple-300 border-purple-500/30',
};

export default function EventCard({ event, index, handlePremiumClick, blurred }: EventCardProps) {
  const [showPayment, setShowPayment] = React.useState(false);
  
  function getReadinessBadgeStyle(readiness: string): string {
    switch (readiness) {
      case '🚨 Needs Immediate Help':
        return 'bg-red-900/50 text-red-300 border-red-500/30';
      case '🔍 Exploring Solutions':
        return 'bg-yellow-900/50 text-yellow-300 border-yellow-500/30';
      case '📋 Planning Transformation':
        return 'bg-green-900/50 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-800/50 text-gray-300 border-gray-600/30';
    }
  }
  
  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col h-full relative ${blurred ? 'blurred-event' : ''}`}>
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
        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium border ${industryColors[event.primaryIndustry] || 'bg-gray-800/50 text-gray-300 border-gray-600/30'}`}
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
        <span className={`px-3 py-1 text-xs rounded-full border ${getReadinessBadgeStyle(event.companyReadiness)}`}>
          {event.companyReadiness}
        </span>
      </div>
      
      <div className="mt-auto pt-3">
        <a
          href={event.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-purple-400 hover:text-purple-300 hover:underline text-sm font-medium transition-colors"
          aria-label="View event details"
        >
          View Details →
        </a>
      </div>
    </div>
  );
}
