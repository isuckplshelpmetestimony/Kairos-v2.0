import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../contexts/AuthContext';
import { config } from '../../config';

const SUGGESTED_PROMPTS = [
  "Show me upcoming tech conferences in Metro Manila",
  "What are the top networking events for startups this month?",
  "List business expos happening in the Philippines this quarter",
  "Find events where CEOs and business leaders are speaking"
];

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

interface AIChatInterfaceProps {
  sessions: ChatSession[];
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  activeSessionId: string;
  setActiveSessionId: React.Dispatch<React.SetStateAction<string>>;
  messagesBySession: Record<string, ChatMessage[]>;
  setMessagesBySession: React.Dispatch<React.SetStateAction<Record<string, ChatMessage[]>>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  editingSessionId: string | null;
  setEditingSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  editingName: string;
  setEditingName: React.Dispatch<React.SetStateAction<string>>;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowPaymentModal?: React.Dispatch<React.SetStateAction<boolean>>;
}

const AIChatInterface: React.FC<AIChatInterfaceProps> = ({
  sessions,
  setSessions,
  activeSessionId,
  setActiveSessionId,
  messagesBySession,
  setMessagesBySession,
  loading,
  setLoading,
  editingSessionId,
  setEditingSessionId,
  editingName,
  setEditingName,
  sidebarOpen,
  setSidebarOpen,
  setShowPaymentModal
}) => {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [showPrompts, setShowPrompts] = useState(true);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      console.log('No auth token found, redirecting to login');
      window.location.href = '/login';
      return;
    }
  }, []);

  // Check if user has access to chat features
  const hasChatAccess = () => {
    if (config.DISABLE_PREMIUM_REQUIREMENTS) return true;
    return user?.role === 'premium' || user?.role === 'admin';
  };

  // Handle payment wall redirect for free users
  const handlePaymentRedirect = () => {
    if (setShowPaymentModal) {
      setShowPaymentModal(true);
    }
  };

  // Override chat interactions for free users
  const handleChatInteraction = (action: string) => {
    if (!hasChatAccess()) {
      handlePaymentRedirect();
      return;
    }
    
    // Proceed with normal action based on action type
    switch (action) {
      case 'sendMessage':
        sendMessage();
        break;
      case 'promptClick':
        // This will be handled by the specific prompt click handler
        break;
      case 'newChat':
        handleNewChat();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (editingSessionId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingSessionId]);

  const handleNewChat = () => {
    if (!hasChatAccess()) {
      handlePaymentRedirect();
      return;
    }
    
    const id = `session_${Date.now()}`;
    const newSession: ChatSession = { id, title: 'New Chat', createdAt: new Date().toISOString() };
    setSessions(prev => [newSession, ...prev]);
    setMessagesBySession(prev => ({ ...prev, [id]: [] }));
    setActiveSessionId(id);
  };

  const handleSessionChange = (id: string) => {
    if (!hasChatAccess()) {
      handlePaymentRedirect();
      return;
    }
    setActiveSessionId(id);
  };

  const handleRenameChat = (sessionId: string) => {
    if (!hasChatAccess()) {
      handlePaymentRedirect();
      return;
    }
    
    console.log('handleRenameChat called with sessionId:', sessionId);
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      console.log('Found session:', session);
      setEditingSessionId(sessionId);
      setEditingName(session.title);
    }
  };

  const handleSaveRename = () => {
    if (!hasChatAccess()) {
      handlePaymentRedirect();
      return;
    }
    
    console.log('handleSaveRename called, editingSessionId:', editingSessionId, 'editingName:', editingName);
    if (editingSessionId && editingName.trim()) {
      setSessions(prev => {
        const updated = prev.map(session => 
          session.id === editingSessionId 
            ? { ...session, title: editingName.trim() }
            : session
        );
        return updated;
      });
      setEditingSessionId(null);
      setEditingName('');
    }
  };

  const handleDeleteChat = (sessionId: string) => {
    if (!hasChatAccess()) {
      handlePaymentRedirect();
      return;
    }
    
    console.log('handleDeleteChat called with sessionId:', sessionId);
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    setMessagesBySession(prev => {
      const updated = { ...prev };
      delete updated[sessionId];
      return updated;
    });
    
    // If we're deleting the active session, switch to the first available session
    if (sessionId === activeSessionId) {
      const remainingSessions = sessions.filter(session => session.id !== sessionId);
      if (remainingSessions.length > 0) {
        setActiveSessionId(remainingSessions[0].id);
      }
    }
  };

  const setActiveSessionMessages = (msgs: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    if (!hasChatAccess()) {
      handlePaymentRedirect();
      return;
    }
    
    setMessagesBySession(prev => ({
      ...prev,
      [activeSessionId]: typeof msgs === 'function' ? msgs(prev[activeSessionId] || []) : msgs
    }));
  };

  const currentMessages = messagesBySession[activeSessionId] || [];

  useEffect(() => {
    // Only scroll to bottom for new messages, not for session changes or initial load
    if (currentMessages.length > 0 && hasInteracted) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages, loading, hasInteracted]);

  const sendMessage = async () => {
    if (!hasChatAccess()) {
      handlePaymentRedirect();
      return;
    }
    
    if (!inputValue.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setActiveSessionMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setHasInteracted(true);

    try {
      const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001/api/crisis/chat' : 'https://kairos-v2-0.onrender.com/api/crisis/chat';
      const authToken = localStorage.getItem('auth_token');
      
      if (!authToken) {
        throw new Error('Authentication required. Please log in.');
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: inputValue,
          session_id: activeSessionId
        })
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication required. Please log in.');
        }
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.ai_response,
        timestamp: new Date()
      };

      setActiveSessionMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMsg: ChatMessage = { type: 'ai', content: 'Error: ' + error.message, id: (Date.now() + 1).toString(), timestamp: new Date() };
      setActiveSessionMessages(prev => [...prev, errorMsg]);
      console.error('Chat error:', error);
      
      // If authentication error, redirect to login
      if (error.message.includes('Authentication required')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    }
    setLoading(false);
  };

  const handlePromptClick = (prompt: string) => {
    if (!hasChatAccess()) {
      handlePaymentRedirect();
      return;
    }
    setInputValue(prompt);
  };

  const handleChatScroll = () => {
    if (!chatScrollRef.current) return;
    setShowPrompts(chatScrollRef.current.scrollTop < 8);
  };

  console.log('Current sessions state:', sessions);

  // If user doesn't have access, show payment wall prompt
  if (!hasChatAccess()) {
    return (
      <div className="flex justify-center items-center w-full">
        <div className="card-premium max-w-4xl w-full flex flex-col p-8 shadow-2xl relative" style={{ minHeight: '420px', maxHeight: '520px', height: '520px' }}>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-2xl font-bold text-white mb-2">Premium Feature</h3>
              <p className="text-gray-300 mb-6">Upgrade to Premium to access Kairos AI Chat Intelligence</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="text-left">
                <h4 className="text-lg font-semibold text-white mb-2">What you get with Premium:</h4>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    AI-powered event intelligence and recommendations
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Personalized networking strategies
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Advanced event filtering and insights
                  </li>
                </ul>
              </div>
            </div>
            
            <button
              onClick={handlePaymentRedirect}
              className="btn-premium px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all hover:scale-105"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-full">
      <div className={`card-premium ${sidebarOpen ? 'max-w-[90rem]' : 'max-w-4xl'} w-full flex flex-row p-0 shadow-2xl relative`} style={{ minHeight: '420px', maxHeight: '520px', height: '520px' }}>
        {/* Menu button when sidebar is closed - positioned outside chat content */}
        {!sidebarOpen && (
          <div className="absolute -left-12 top-4 z-10">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 bg-gray-800/50 backdrop-blur-sm border border-white/10"
              title="Open chat menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 glass-effect border-r border-white/10 flex flex-col" style={{backdropFilter: 'blur(8px)'}}>
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Chats</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-white/70 hover:text-white transition-colors p-1"
                  title="Close sidebar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button
                className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold shadow hover:from-purple-600 hover:to-indigo-600 transition-all"
                onClick={handleNewChat}
              >
                + New Chat
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    session.id === activeSessionId ? 'badge-premium' : 'px-3 py-2 text-white/90 hover:bg-white/10 rounded-lg'
                  }`}
                  onClick={() => handleSessionChange(session.id)}
                >
                  <div className="flex-1 min-w-0">
                    {editingSessionId === session.id ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={handleSaveRename}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveRename()}
                        className="bg-transparent border-none outline-none text-white text-sm w-full"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm truncate block">{session.title}</span>
                    )}
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameChat(session.id);
                      }}
                      className="text-white/70 hover:text-white p-1 mr-1"
                      title="Rename chat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(session.id);
                      }}
                      className="text-white/70 hover:text-red-400 p-1"
                      title="Delete chat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </nav>
          </div>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col p-6">
          {/* Suggested Prompts - only visible at top */}
          {showPrompts && (
            <div className="flex flex-col gap-2 mb-3 justify-center items-center">
              <div className="flex flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => handlePromptClick(SUGGESTED_PROMPTS[0])}
                  className="glass-effect border border-white/10 text-white/90 px-4 py-2 rounded-xl shadow-md text-sm font-medium hover:bg-white/10 transition"
                    style={{backdropFilter: 'blur(8px)'}}>
                  {SUGGESTED_PROMPTS[0]}
                </button>
                <button
                  type="button"
                  onClick={() => handlePromptClick(SUGGESTED_PROMPTS[1])}
                  className="glass-effect border border-white/10 text-white/90 px-4 py-2 rounded-xl shadow-md text-sm font-medium hover:bg-white/10 transition"
                    style={{backdropFilter: 'blur(8px)'}}>
                  {SUGGESTED_PROMPTS[1]}
                </button>
              </div>
              <div className="flex flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => handlePromptClick(SUGGESTED_PROMPTS[2])}
                  className="glass-effect border border-white/10 text-white/90 px-4 py-2 rounded-xl shadow-md text-sm font-medium hover:bg-white/10 transition"
                    style={{backdropFilter: 'blur(8px)'}}>
                  {SUGGESTED_PROMPTS[2]}
                </button>
                <button
                  type="button"
                  onClick={() => handlePromptClick(SUGGESTED_PROMPTS[3])}
                  className="glass-effect border border-white/10 text-white/90 px-4 py-2 rounded-xl shadow-md text-sm font-medium hover:bg-white/10 transition"
                    style={{backdropFilter: 'blur(8px)'}}>
                  {SUGGESTED_PROMPTS[3]}
                </button>
              </div>
            </div>
          )}
          
          {/* Chat messages area - scrollable, triggers prompt visibility */}
          <div ref={chatScrollRef} onScroll={handleChatScroll} className="flex-1 overflow-y-auto mb-3 flex flex-col gap-3 pr-1" style={{ minHeight: 0 }}>
            <div className="flex flex-col gap-3">
              {currentMessages.map(msg => (
              <div
                key={msg.id}
                className={
                  msg.type === 'user'
                    ? 'self-end max-w-[85%] bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-3 rounded-2xl shadow-lg font-medium text-base'
                    : 'self-start max-w-[90%] glass-effect border border-white/10 text-blue-100 px-5 py-3 rounded-2xl shadow-md font-medium text-base'
                }
                style={{ wordBreak: 'break-word' }}
              >
                {msg.type === 'ai' ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({node, ...props}) => (
                        <div className="overflow-x-auto my-4">
                          <table className="min-w-full border-collapse border border-gray-500 bg-gray-800/50 rounded-lg shadow-lg" {...props} />
                        </div>
                      ),
                      thead: ({node, ...props}) => (
                        <thead className="bg-gray-700/70" {...props} />
                      ),
                      tbody: ({node, ...props}) => (
                        <tbody className="bg-gray-800/30" {...props} />
                      ),
                      tr: ({node, ...props}) => (
                        <tr className="border-b border-gray-500 hover:bg-gray-700/50" {...props} />
                      ),
                      th: ({node, ...props}) => (
                        <th className="px-4 py-3 text-left text-white font-semibold border-r border-gray-500" {...props} />
                      ),
                      td: ({node, ...props}) => (
                        <td className="px-4 py-3 text-gray-200 border-r border-gray-500" {...props} />
                      ),
                      code: ({node, inline, className, children, ...props}: any) => (
                        inline ? 
                          <code className="bg-gray-700 px-1 py-0.5 rounded text-sm font-mono" {...props}>{children}</code> :
                          <code className="block bg-gray-700 p-3 rounded text-sm font-mono overflow-x-auto" {...props}>{children}</code>
                      ),
                      pre: ({node, ...props}) => (
                        <pre className="bg-gray-700 p-3 rounded text-sm font-mono overflow-x-auto my-2" {...props} />
                      ),
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-purple-500 pl-4 my-2 italic text-gray-300" {...props} />
                      ),
                      ul: ({node, ...props}) => (
                        <ul className="list-disc list-inside my-2 space-y-1" {...props} />
                      ),
                      ol: ({node, ...props}) => (
                        <ol className="list-decimal list-inside my-2 space-y-1" {...props} />
                      ),
                      li: ({node, ...props}) => (
                        <li className="text-gray-200" {...props} />
                      ),
                      h1: ({node, ...props}) => (
                        <h1 className="text-2xl font-bold text-white my-4" {...props} />
                      ),
                      h2: ({node, ...props}) => (
                        <h2 className="text-xl font-bold text-white my-3" {...props} />
                      ),
                      h3: ({node, ...props}) => (
                        <h3 className="text-lg font-bold text-white my-2" {...props} />
                      ),
                      h4: ({node, ...props}) => (
                        <h4 className="text-base font-bold text-white my-2" {...props} />
                      ),
                      p: ({node, ...props}) => (
                        <p className="my-3 leading-relaxed text-gray-100" {...props} />
                      ),
                      strong: ({node, ...props}) => (
                        <strong className="font-semibold text-blue-100" {...props} />
                      ),
                      em: ({node, ...props}) => (
                        <em className="italic text-gray-300" {...props} />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            ))}
            </div>
            {loading && <div className="text-gray-400">Kairos is thinking...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-3 mt-auto">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything about business events happening..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-base"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="btn-premium px-6 py-3 text-base font-semibold rounded-xl shadow-lg transition disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface; 