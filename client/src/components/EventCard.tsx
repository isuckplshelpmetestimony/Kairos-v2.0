import React from 'react';
import { Event } from '../lib/types';

interface EventCardProps {
  event: Event;
}

const industryColors: Record<string, string> = {
  'Technology': 'bg-blue-100 text-blue-800',
  'Government & Public Sector': 'bg-green-100 text-green-800',
  'Retail & E-commerce': 'bg-orange-100 text-orange-800',
  'Banking & Financial Services': 'bg-purple-100 text-purple-800',
};

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition p-6 flex flex-col h-full">
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
      <div className="flex flex-wrap gap-1 mb-2" aria-label="Company stages">
        {event.companyStages.map((stage, i) => (
          <span key={i} className="bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs font-medium">
            {stage}
          </span>
        ))}
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
