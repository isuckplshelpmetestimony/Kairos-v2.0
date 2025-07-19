import * as React from "react";
import { useState, useEffect } from "react";
import SearchSection from "../components/SearchSection";
import FeaturedEvents from "../components/FeaturedEvents";
import SearchResults from "../components/SearchResults";
import { filterEvents, getFeaturedEvents } from "../lib/eventFilters";
import type { SearchFilters, Event } from "../lib/types";
import { loadEvents, loadStartupEvents } from "../data/events";
import { hasFullAccess } from '../lib/authUtils';
import PaymentPage from '../components/PaymentPage';

interface HomeProps {
  user: { email: string; phone: string; role: string };
  premiumUsers: any[];
  setShowPaymentModal: React.Dispatch<React.SetStateAction<boolean>>;
  showPaymentModal: boolean;
}

export default function Home({ user, premiumUsers, setShowPaymentModal, showPaymentModal }: HomeProps) {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    industry: 'All industries',
    companyStage: 'All categories',
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([loadEvents(), loadStartupEvents()]).then(([events1, events2]) => {
      setAllEvents([...events1, ...events2]);
      setIsLoading(false);
    });
  }, []);

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    const results = filterEvents(allEvents, filters);
    setFilteredEvents(results);
    setHasSearched(true);
  };

  function showEventDetails(eventId: string) {
    alert('Show event details for event ID: ' + eventId);
  }

  function handlePremiumClick(eventId: string) {
    if (hasFullAccess(user.email, user.phone, premiumUsers)) {
      showEventDetails(eventId);
    } else {
      setShowPaymentModal(true);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
      {/* Main Content */}
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* AI-Powered Tag */}
          <div className="inline-flex items-center space-x-2 bg-gray-800/50 border border-purple-400/30 rounded-full px-4 py-2 mb-8">
            <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span className="text-white text-sm font-medium">AI-Powered Event Discovery</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            The all-in-one professional events platform for{' '}
            <span className="text-blue-400">founders</span>
          </h1>

          {/* Description */}
          <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect with professional events that count. KAIROS creates the difference with smart recommendations, premium networking opportunities, and curated experiences.
          </p>

          {/* Search Section */}
          <SearchSection onSearch={handleSearch} />
        </div>

        {/* Results Section */}
        {isLoading ? (
          <div className="text-center text-white/60 text-lg mt-12">Loading events...</div>
        ) : hasSearched ? (
          <div className="mt-16 px-4">
            <div className="max-w-7xl mx-auto">
              <SearchResults 
                events={filteredEvents} 
                hasSearched={hasSearched} 
                handlePremiumClick={handlePremiumClick}
                searchFilters={searchFilters}
              />
            </div>
          </div>
        ) : (
          <div className="mt-16 px-4">
            <div className="max-w-7xl mx-auto">
              <FeaturedEvents events={getFeaturedEvents(allEvents)} setShowPaymentModal={setShowPaymentModal} />
            </div>
          </div>
        )}
        
        {showPaymentModal && <PaymentPage onClose={() => setShowPaymentModal(false)} />}
      </main>
    </div>
  );
}
