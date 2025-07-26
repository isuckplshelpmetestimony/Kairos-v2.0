import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

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

const AIChatInterface: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [showPrompts, setShowPrompts] = useState(true);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Chat session state
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
    if (editingSessionId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingSessionId]);

  const handleNewChat = () => {
    const id = `session_${Date.now()}`;
    const newSession: ChatSession = { id, title: 'New Chat', createdAt: new Date().toISOString() };
    setSessions(prev => [newSession, ...prev]);
    setMessagesBySession(prev => ({ ...prev, [id]: [] }));
    setActiveSessionId(id);
  };

  const handleSessionChange = (id: string) => {
    setActiveSessionId(id);
  };

  const handleRenameChat = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setEditingSessionId(sessionId);
      setEditingName(session.title);
    }
  };

  const handleSaveRename = () => {
    if (editingSessionId && editingName.trim()) {
      setSessions(prev => {
        const updated = prev.map(s => 
          s.id === editingSessionId ? { ...s, title: editingName.trim() } : s
        );
        localStorage.setItem('kairos_chat_sessions', JSON.stringify(updated));
        return updated;
      });
    }
    setEditingSessionId(null);
    setEditingName('');
  };

  const handleDeleteChat = (sessionId: string) => {
    if (sessions.length > 1) {
      setSessions(prev => {
        const updated = prev.filter(s => s.id !== sessionId);
        localStorage.setItem('kairos_chat_sessions', JSON.stringify(updated));
        return updated;
      });
      setMessagesBySession(prev => {
        const newMessages = { ...prev };
        delete newMessages[sessionId];
        localStorage.setItem('kairos_chat_messages', JSON.stringify(newMessages));
        return newMessages;
      });
      
      // If we're deleting the active session, switch to the first available session
      if (sessionId === activeSessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setActiveSessionId(remainingSessions[0].id);
        }
      }
    }
  };

  const setActiveSessionMessages = (msgs: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
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
    if (!inputValue.trim()) return;
    setHasInteracted(true);
    const userMsg: ChatMessage = { type: 'user', content: inputValue, id: Date.now().toString(), timestamp: new Date() };
    setActiveSessionMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const currentMessage = inputValue;
      const response = await fetch('/api/crisis/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: currentMessage,
          session_id: activeSessionId
        })
      });
      const data = await response.json();
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.ai_response,
        timestamp: new Date(),
        followups: data.suggested_followups,
        conversationStage: data.conversation_stage,
        intentDetected: data.intent_detected
      };
      setActiveSessionMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMsg: ChatMessage = { type: 'ai', content: 'Error: ' + error.message, id: (Date.now() + 1).toString(), timestamp: new Date() };
      setActiveSessionMessages(prev => [...prev, errorMsg]);
      console.error('Chat error:', error);
    }
    setLoading(false);
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleChatScroll = () => {
    if (!chatScrollRef.current) return;
    setShowPrompts(chatScrollRef.current.scrollTop < 8);
  };

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
              {Object.entries(sessions).map(([sessionId, session]) => (
                <div
                  key={sessionId}
                  className={`mb-2 cursor-pointer transition-all text-sm group ${
                    sessionId === activeSessionId ? 'badge-premium' : 'px-3 py-2 text-white/90 hover:bg-white/10 rounded-lg'
                  }`}
                  onClick={() => handleSessionChange(sessionId)}
                >
                  {editingSessionId === sessionId ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={handleSaveRename}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveRename()}
                      className="w-full bg-transparent text-white focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm truncate">{session.title}</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameChat(sessionId);
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
                            handleDeleteChat(sessionId);
                          }}
                          className="text-white/70 hover:text-white p-1"
                          title="Delete chat"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col p-4">
          
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
            {currentMessages.map(msg => (
              <div
                key={msg.id}
                className={
                  msg.type === 'user'
                    ? 'self-end max-w-[75%] bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-3 rounded-2xl shadow-lg font-medium text-base'
                    : 'self-start max-w-[75%] glass-effect border border-white/10 text-blue-100 px-5 py-3 rounded-2xl shadow-md font-medium text-base'
                }
                style={{ wordBreak: 'break-word' }}
              >
                {msg.type === 'ai' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            ))}
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