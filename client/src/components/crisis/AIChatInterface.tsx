import React, { useState } from 'react';

export const AIChatInterface = () => {
  const [messages, setMessages] = useState<{ type: 'user' | 'ai'; content: string; id: number }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="glass-card p-6 rounded-3xl">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span className="gradient-text">Company Intelligence</span>
      </h2>

      <div className="h-64 overflow-y-auto mb-4 flex flex-col gap-3 pr-2">
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
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-gray-400">AI is thinking...</div>}
      </div>

      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about companies in crisis..."
          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400"
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
  );
};

export default AIChatInterface; 