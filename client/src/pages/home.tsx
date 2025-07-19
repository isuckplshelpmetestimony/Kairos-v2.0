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
    // For premium users, they can access the event details
    // This could open a modal or navigate to a details page
    console.log('Premium user accessing event:', eventId);
    // TODO: Implement proper event details view for premium users
  }

  function handlePremiumClick(eventId: string) {
    // Check if user is actually premium (not just admin)
    const isPremiumUser = user.role === 'premium' || hasFullAccess(user.email, user.phone, premiumUsers);
    
    if (isPremiumUser && user.role !== 'free') {
      showEventDetails(eventId);
    } else {
      // Free users go directly to payment wall - no event details revealed
      setShowPaymentModal(true);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1b3a 0%, #2d2f5e 100%)' }}>
      {/* Main Content */}
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Spacing to maintain layout */}
          <div className="mb-8"></div>
          
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Discover Business Events for{' '}
            <span className="gradient-text">Strategic Networking</span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Find networking opportunities where your target clients attend in the Philippines
          </p>

          {/* Search Section */}
          <SearchSection onSearch={handleSearch} />
        </div>

        {/* Results Section */}
        {isLoading ? (
          <div className="text-center text-gray-300 text-lg mt-12">Loading events...</div>
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
