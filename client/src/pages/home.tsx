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
import SearchToggle from '../components/SearchToggle';
import AIChatInterface from '../components/crisis/AIChatInterface';
import { useRef } from "react";

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
  const [searchMode, setSearchMode] = useState<'event' | 'company'>('event');
  const chatRef = useRef<HTMLDivElement>(null);
  const [showDockedChat, setShowDockedChat] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([loadEvents(), loadStartupEvents()]).then(([events1, events2]) => {
      setAllEvents([...events1, ...events2]);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (searchMode !== 'company') {
      setShowDockedChat(false);
      return;
    }
    const handleScroll = () => {
      if (!chatRef.current) return;
      const rect = chatRef.current.getBoundingClientRect();
      setShowDockedChat(rect.bottom < 80); // 80px from top
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchMode]);

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

          {/* Search Toggle */}
          <SearchToggle
            mode={searchMode}
            onChange={setSearchMode}
            disabled={false}
          />
          {/* Search Section (only for event mode) */}
          {searchMode === 'event' && <SearchSection onSearch={handleSearch} />}
          {/* Company Intelligence: single search bar, no filters/results */}
          {searchMode === 'company' && (
            (user.role === 'admin' || user.role === 'premium') ? (
              <div ref={chatRef}><AIChatInterface /></div>
            ) : (
            <div ref={chatRef}>
              <form
                className="glass-effect p-6 max-w-4xl mx-auto"
                onSubmit={e => e.preventDefault()}
              >
                <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                  <div className="relative flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Search companies, industries, or signals..."
                      className="pl-4 pr-4 py-4 text-lg rounded-lg input-premium placeholder-white/70 w-full"
                      aria-label="Search companies"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full md:w-auto px-8 py-4 text-base rounded-lg h-14 btn-premium"
                    tabIndex={-1}
                    disabled
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
            )
          )}
        </div>

        {/* Always show event cards below the search bar/chatbot */}
        <div className="mt-16 px-4">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="text-center text-gray-300 text-lg">Loading events...</div>
            ) : hasSearched ? (
              <SearchResults 
                events={filteredEvents} 
                hasSearched={hasSearched} 
                handlePremiumClick={handlePremiumClick}
                searchFilters={searchFilters}
              />
            ) : (
              <FeaturedEvents events={getFeaturedEvents(allEvents)} setShowPaymentModal={setShowPaymentModal} />
            )}
          </div>
        </div>

        {/* Docked Chatbot: only in company mode, only when inline chat is out of view */}
        {searchMode === 'company' && showDockedChat && (
          <div style={{position: 'fixed', bottom: 24, left: 0, right: 0, zIndex: 50}} className="flex justify-center w-full pointer-events-none">
            <div className="w-full max-w-xl px-4 pointer-events-auto">
              <form
                className="backdrop-blur-md bg-gray-800/80 border border-gray-700 rounded-full shadow flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-purple-500 transition-colors"
                onSubmit={e => { e.preventDefault(); setShowChatModal(true); }}
                onClick={() => setShowChatModal(true)}
              >
                <input
                  type="text"
                  placeholder="Ask me anything about Philippine companies..."
                  className="flex-1 bg-transparent border-none outline-none text-white text-sm px-2 py-1 placeholder-white/60 font-medium"
                  readOnly
                />
                <button type="submit" className="ml-2 text-purple-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </form>
            </div>
          </div>
        )}
        {/* Modal for full AIChatInterface */}
        {showChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowChatModal(false)}>
            <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full shadow-xl relative" onClick={e => e.stopPropagation()}>
              <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setShowChatModal(false)}>&times;</button>
              <AIChatInterface />
            </div>
          </div>
        )}
        
        {showPaymentModal && <PaymentPage onClose={() => setShowPaymentModal(false)} />}
      </main>
    </div>
  );
}
