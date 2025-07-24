import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_PROMPTS = [
  "Show me upcoming tech conferences in Metro Manila",
  "What are the top networking events for startups this month?",
  "List business expos happening in the Philippines this quarter",
  "Find events where CEOs and business leaders are speaking"
];

// Update ChatMessage type to include new fields
interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  followups?: any;
  conversationStage?: any;
  intentDetected?: any;
}

export const AIChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showPrompts, setShowPrompts] = useState(true);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Remove welcome message on first load
  // useEffect(() => {
  //   if (!hasInteracted && messages.length === 0) {
  //     const welcomeMsg = { 
  //       type: 'ai' as const, 
  //       content: "Hey there! 👋 I'm Kairos, your business intelligence buddy. I've got the inside scoop on Philippine companies and their challenges. What would you like to know about today?", 
  //       id: Date.now() 
  //     };
  //     setMessages([welcomeMsg]);
  //   }
  // }, [hasInteracted, messages.length]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setHasInteracted(true);
    const userMsg: ChatMessage = { type: 'user', content: input, id: Date.now().toString(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      console.log('Token being sent:', token ? 'Present' : 'Missing');
      const currentMessage = input;
      const response = await fetch('/api/crisis/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          message: currentMessage,
          session_id: sessionId
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

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMsg: ChatMessage = { type: 'ai', content: 'Error: ' + error.message, id: (Date.now() + 1).toString(), timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
      console.error('Chat error:', error);
    }
    setLoading(false);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleChatScroll = () => {
    if (!chatScrollRef.current) return;
    setShowPrompts(chatScrollRef.current.scrollTop < 8);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex justify-center items-center w-full mt-4">
      <div className="card-premium max-w-3xl w-full flex flex-col p-8 shadow-2xl" style={{ minHeight: '420px', maxHeight: '480px', height: '480px' }}>
        {/* Suggested Prompts - only visible at top */}
        {showPrompts && (
        <div className="flex flex-col gap-2 mb-2 justify-center items-center" style={{ marginTop: '-12px' }}>
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
        <div ref={chatScrollRef} onScroll={handleChatScroll} className="flex-1 overflow-y-auto mb-2 flex flex-col gap-3 pr-1" style={{ minHeight: 0 }}>
          {messages.map(msg => (
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
  );
};

export default AIChatInterface; 