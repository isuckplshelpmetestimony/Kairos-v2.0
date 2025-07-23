import React from 'react';

interface EventSearchInterfaceProps {}

const EventSearchInterface: React.FC<EventSearchInterfaceProps> = () => {
  return (
    <div className="space-y-8">
      {/* Event search form */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Event Title, Keywords, Company..."
            className="md:col-span-1 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
          />
          <select className="px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none">
            <option>All industries</option>
            <option>Technology</option>
            <option>Finance</option>
            <option>Healthcare</option>
          </select>
          <select className="px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none">
            <option>All categories</option>
            <option>Conference</option>
            <option>Workshop</option>
            <option>Networking</option>
          </select>
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
            Find Events
          </button>
        </div>
      </div>
      {/* Featured Events section */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-6">Featured Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Event cards - your existing event card components */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="mb-4">
              <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">Technology</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-2">
              Driving Business Growth Through Talent Development
            </h4>
            <p className="text-gray-300 mb-2">Manila - 25 Jul 2025</p>
            <p className="text-gray-400 text-sm mb-2">Attendees:</p>
            <p className="text-white text-sm mb-4">HR directors, Business executives</p>
            <p className="text-gray-400 text-sm">Goals:</p>
          </div>
          {/* Add more event cards as needed */}
        </div>
      </div>
    </div>
  );
};

export default EventSearchInterface; 