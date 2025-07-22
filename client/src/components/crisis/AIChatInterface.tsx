import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_PROMPTS = [
  "Hey Kairos, show me the companies in the most trouble",
  "Which companies are struggling with digital transformation?",
  "Tell me about the banking sector crisis",
  "What's the latest on Philippine Airlines?"
];

export const AIChatInterface = () => {
  const [messages, setMessages] = useState<{ type: 'user' | 'ai'; content: string; id: number }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

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
    const userMsg = { type: 'user' as const, content: input, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      console.log('Token being sent:', token ? 'Present' : 'Missing');
      
      const response = await fetch('/api/crisis/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ message: input })
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        console.log('Failed to parse JSON, raw response:', text);
        throw new Error('Failed to parse JSON response');
      }

      if (!response.ok) {
        // If backend returned a specific error message, show it
        const errorMsg = data && data.error ? data.error : `Server error: ${response.status}`;
        throw new Error(errorMsg);
      }

      const aiMsg = { type: 'ai' as const, content: data.ai_response || JSON.stringify(data), id: Date.now() + 1 };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      const errorMsg = { type: 'ai' as const, content: 'Error: ' + error.message, id: Date.now() + 1 };
      setMessages(prev => [...prev, errorMsg]);
      console.error('Chat error:', error);
    }
    setLoading(false);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex justify-center items-center w-full mt-4">
      <div className="glass-effect border border-white/10 shadow-2xl rounded-[2.5rem] p-8 max-w-3xl w-full flex flex-col" style={{ minHeight: '420px', maxHeight: '480px', height: '480px', background: 'rgba(30,32,60,0.85)', backdropFilter: 'blur(16px)' }}>
        {/* Suggested Prompts */}
        <div className="flex flex-col gap-2 mb-2 justify-center items-center" style={{ marginTop: '-12px' }}>
          <div className="flex flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => handlePromptClick(SUGGESTED_PROMPTS[0])}
              className="glass-effect border border-white/10 text-white/90 px-4 py-2 rounded-xl shadow-md text-sm font-medium hover:bg-white/10 transition"
              style={{backdropFilter: 'blur(8px)'}}
            >
              {SUGGESTED_PROMPTS[0]}
            </button>
            <button
              type="button"
              onClick={() => handlePromptClick(SUGGESTED_PROMPTS[1])}
              className="glass-effect border border-white/10 text-white/90 px-4 py-2 rounded-xl shadow-md text-sm font-medium hover:bg-white/10 transition"
              style={{backdropFilter: 'blur(8px)'}}
            >
              {SUGGESTED_PROMPTS[1]}
            </button>
          </div>
          <div className="flex flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => handlePromptClick(SUGGESTED_PROMPTS[2])}
              className="glass-effect border border-white/10 text-white/90 px-4 py-2 rounded-xl shadow-md text-sm font-medium hover:bg-white/10 transition"
              style={{backdropFilter: 'blur(8px)'}}
            >
              {SUGGESTED_PROMPTS[2]}
            </button>
            <button
              type="button"
              onClick={() => handlePromptClick(SUGGESTED_PROMPTS[3])}
              className="glass-effect border border-white/10 text-white/90 px-4 py-2 rounded-xl shadow-md text-sm font-medium hover:bg-white/10 transition"
              style={{backdropFilter: 'blur(8px)'}}
            >
              {SUGGESTED_PROMPTS[3]}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-2 flex flex-col gap-3 pr-1" style={{ minHeight: 0 }}>
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
            placeholder="Ask me anything about Philippine companies..."
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