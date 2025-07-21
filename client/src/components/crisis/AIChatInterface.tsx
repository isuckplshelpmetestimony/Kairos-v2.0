import React, { useState, useRef, useEffect } from 'react';

export const AIChatInterface = () => {
  const [messages, setMessages] = useState<{ type: 'user' | 'ai'; content: string; id: number }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { type: 'user' as const, content: input, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/crisis/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      const aiMsg = { type: 'ai' as const, content: data.ai_response, id: Date.now() + 1 };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      const errorMsg = { type: 'ai' as const, content: 'Error: ' + error.message, id: Date.now() + 1 };
      setMessages(prev => [...prev, errorMsg]);
    }
    setLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="bg-gradient-to-br from-black/60 to-blue-900/60 glass-card p-6 rounded-3xl shadow-xl border border-white/10 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Company Intelligence</h2>
      <div className="h-64 overflow-y-auto mb-4 space-y-3 scrollbar-thin scrollbar-thumb-blue-700/40 scrollbar-track-transparent pr-2 bg-black/20 rounded-xl p-2">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`max-w-[80%] p-3 rounded-lg text-sm break-words shadow-md transition-all duration-200 ${
              msg.type === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto'
                : 'bg-white/10 text-blue-100 mr-auto border border-blue-900/20'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-gray-400">AI is thinking...</div>}
        <div ref={chatEndRef} />
      </div>
      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about companies in crisis..."
          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/40 transition"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIChatInterface; 