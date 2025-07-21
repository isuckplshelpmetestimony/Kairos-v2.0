import React, { useState } from 'react';

const SUGGESTED_PROMPTS = [
  "Show me companies with the highest crisis score",
  "List companies in the technology sector",
  "Who are the decision makers at [company]?",
  "What are the main crisis signals for [company]?",
  "Which companies are planning transformation?",
  "Show companies with recent layoffs or leadership changes",
  "List companies with high financial distress"
];

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

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="glass-card p-6 rounded-3xl">
      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePromptClick(prompt)}
            className="glass-effect border border-white/10 text-white/90 px-4 py-2 rounded-xl shadow-md text-sm font-medium hover:bg-white/10 transition"
            style={{backdropFilter: 'blur(8px)'}}
          >
            {prompt}
          </button>
        ))}
      </div>

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