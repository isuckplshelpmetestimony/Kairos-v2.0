import * as React from "react";
import { useState, useEffect } from "react";
import Hero from "../components/Hero";
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
    industry: 'All Types',
    companyStage: 'Topic',
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
      {/* Hero Section */}
      <Hero onSearch={handleSearch} />

      {/* Search Results Section */}
      {hasSearched && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="text-center text-white/60 text-lg">Loading events...</div>
            ) : (
              <SearchResults 
                events={filteredEvents} 
                hasSearched={hasSearched} 
                handlePremiumClick={handlePremiumClick}
                searchFilters={searchFilters}
              />
            )}
          </div>
        </section>
      )}

      {/* Payment Modal */}
      {showPaymentModal && <PaymentPage onClose={() => setShowPaymentModal(false)} />}
    </div>
  );
}
