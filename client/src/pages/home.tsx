import * as React from "react";
import { useState, useEffect } from "react";
import Header from "../components/Header";
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Main Content */}
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Discover Business Events for Strategic Networking
          </h1>
          <p className="text-lg text-slate-600 mb-12">
            Find networking opportunities where your target clients attend in the Philippines
          </p>
          <SearchSection onSearch={handleSearch} />
        </div>
        {isLoading ? (
          <div className="text-center text-gray-500 mt-12">Loading events...</div>
        ) : hasSearched ? (
          <SearchResults events={filteredEvents} hasSearched={hasSearched} handlePremiumClick={handlePremiumClick} />
        ) : (
          <FeaturedEvents events={getFeaturedEvents(allEvents)} />
        )}
        {showPaymentModal && <PaymentPage onClose={() => setShowPaymentModal(false)} />}
      </main>
      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            © 2025 Kairos v2.0. All rights reserved. Terms & Conditions and Privacy Policy.
          </p>
        </div>
      </footer>
    </div>
  );
}
