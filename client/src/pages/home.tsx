import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from '../contexts/AuthContext';
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
import { config } from '../config';

// Chat interfaces moved to top level
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  followups?: any;
  conversationStage?: any;
  intentDetected?: any;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
}

const getInitialSessions = (): ChatSession[] => {
  const stored = localStorage.getItem('kairos_chat_sessions');
  if (stored) return JSON.parse(stored);
  const id = `session_${Date.now()}`;
  return [{ id, title: 'New Chat', createdAt: new Date().toISOString() }];
};

const getInitialMessages = (): Record<string, ChatMessage[]> => {
  const stored = localStorage.getItem('kairos_chat_messages');
  if (stored) return JSON.parse(stored);
  return {};
};

interface HomeProps {
  user: { email: string; phone: string; role: string };
  premiumUsers: any[];
  setShowPaymentModal: React.Dispatch<React.SetStateAction<boolean>>;
  showPaymentModal: boolean;
}

export default function Home({ user, premiumUsers, setShowPaymentModal, showPaymentModal }: HomeProps) {
  const { isPremium } = useAuth();
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

  // Chat state moved to home component level for persistence
  const [sessions, setSessions] = useState<ChatSession[]>(getInitialSessions());
  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0]?.id || '');
  const [messagesBySession, setMessagesBySession] = useState<Record<string, ChatMessage[]>>(getInitialMessages());
  const [loading, setLoading] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Persist sessions/messages
  useEffect(() => {
    localStorage.setItem('kairos_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);
  useEffect(() => {
    localStorage.setItem('kairos_chat_messages', JSON.stringify(messagesBySession));
  }, [messagesBySession]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([loadEvents(), loadStartupEvents()])
      .then(([events1, events2]) => {
        const allEventsCombined = [...events1, ...events2];
        setAllEvents(allEventsCombined);
        console.log(`✅ Loaded ${allEventsCombined.length} events successfully`);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('❌ Error loading events:', error);
        setAllEvents([]);
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
    // If premium requirements are disabled, allow all users to access events
    if (config.DISABLE_PREMIUM_REQUIREMENTS) {
      showEventDetails(eventId);
      return;
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      {/* Main Content */}
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-8"></div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Discover Business Events for{' '}
            <span className="gradient-text">Strategic Networking</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Find networking opportunities where your target clients attend in the Philippines
          </p>
          <SearchToggle
            mode={searchMode}
            onChange={setSearchMode}
            disabled={false}
          />
          {searchMode === 'event' && <SearchSection onSearch={handleSearch} />}
          {searchMode === 'company' && (
            <div ref={chatRef} id="kairos-chatbox">
              <AIChatInterface 
                sessions={sessions}
                setSessions={setSessions}
                activeSessionId={activeSessionId}
                setActiveSessionId={setActiveSessionId}
                messagesBySession={messagesBySession}
                setMessagesBySession={setMessagesBySession}
                loading={loading}
                setLoading={setLoading}
                editingSessionId={editingSessionId}
                setEditingSessionId={setEditingSessionId}
                editingName={editingName}
                setEditingName={setEditingName}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                setShowPaymentModal={setShowPaymentModal}
              />
            </div>
          )}
        </div>
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
        {searchMode === 'company' && (
          <div style={{position: 'fixed', bottom: 24, left: 0, right: 0, zIndex: 50}} className="flex justify-center w-full">
            <div className="w-full max-w-xl px-4">
              <form
                className={`liquid-dock backdrop-blur-md bg-gray-800/80 border border-gray-700 rounded-full shadow flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-purple-500 transition-colors transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu
                  ${showDockedChat ? 'opacity-100 scale-95 pointer-events-auto' : 'opacity-0 scale-100 pointer-events-none'}`}
                onSubmit={e => { e.preventDefault();
                  const chatbox = document.getElementById('kairos-chatbox');
                  if (chatbox) {
                    chatbox.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                onClick={() => {
                  const chatbox = document.getElementById('kairos-chatbox');
                  if (chatbox) {
                    chatbox.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
              >
                <input
                  type="text"
                  placeholder="Ask me anything about business events happening..."
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
        {showChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowChatModal(false)}>
            <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full shadow-xl relative" onClick={e => e.stopPropagation()}>
              <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setShowChatModal(false)}>&times;</button>
              <AIChatInterface 
                sessions={sessions}
                setSessions={setSessions}
                activeSessionId={activeSessionId}
                setActiveSessionId={setActiveSessionId}
                messagesBySession={messagesBySession}
                setMessagesBySession={setMessagesBySession}
                loading={loading}
                setLoading={setLoading}
                editingSessionId={editingSessionId}
                setEditingSessionId={setEditingSessionId}
                editingName={editingName}
                setEditingName={setEditingName}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                setShowPaymentModal={setShowPaymentModal}
              />
            </div>
          </div>
        )}
        {showPaymentModal && <PaymentPage onClose={() => setShowPaymentModal(false)} />}
      </main>
    </div>
  );
}
