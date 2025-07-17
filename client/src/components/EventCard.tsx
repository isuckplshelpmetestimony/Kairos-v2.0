import React from 'react';
import { Event } from '../lib/types';
import PaymentPage from './PaymentPage';

interface EventCardProps {
  event: Event;
  index?: number;
  handlePremiumClick?: (eventId: string) => void;
}

const industryColors: Record<string, string> = {
  'Technology': 'bg-blue-100 text-blue-800',
  'Government & Public Sector': 'bg-green-100 text-green-800',
  'Retail & E-commerce': 'bg-orange-100 text-orange-800',
  'Banking & Financial Services': 'bg-purple-100 text-purple-800',
};

export default function EventCard({ event, index, handlePremiumClick }: EventCardProps) {
  const [showPayment, setShowPayment] = React.useState(false);
  function getReadinessBadgeStyle(readiness: string): string {
    switch (readiness) {
      case '🚨 Needs Immediate Help':
        return 'bg-red-100 text-red-700';
      case '🔍 Exploring Solutions':
        return 'bg-yellow-100 text-yellow-700';
      case '📋 Planning Transformation':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
  const isPremium = typeof index === 'number' && index > 0;
  return (
    <div className={`bg-white rounded-lg shadow hover:shadow-md transition p-6 flex flex-col h-full relative ${isPremium ? 'blurred-event' : ''}`}>
      {isPremium && (
        <div className="premium-overlay" onClick={() => handlePremiumClick && handlePremiumClick(event.id)}>
          <div className="premium-badge">Premium Event</div>
          <div className="unlock-text">Unlock access to premium events</div>
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold" aria-label="Event name">{event.eventName}</h3>
        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${industryColors[event.primaryIndustry] || 'bg-gray-100 text-gray-700'}`}
          aria-label="Industry">
          {event.primaryIndustry}
        </span>
      </div>
      <div className="text-sm text-gray-500 mb-2" aria-label="Date and location">{event.dateLocation}</div>
      <div className="mb-2">
        <span className="block text-xs text-gray-400">Attendees:</span>
        <span className="text-sm">{event.attendees}</span>
      </div>
      <div className="mb-2">
        <span className="block text-xs text-gray-400">Goals:</span>
        <span className="text-sm">{event.goals}</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-2" aria-label="Company readiness">
        <span className={`px-2 py-1 text-xs rounded ${getReadinessBadgeStyle(event.companyReadiness)}`}>
          {event.companyReadiness}
          </span>
      </div>
      <div className="mt-auto pt-2">
        <a
          href={event.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-blue-600 hover:underline text-sm font-medium"
          aria-label="View event details"
        >
          View Details
        </a>
      </div>
    </div>
  );
}
