import React, { useState } from 'react';

interface CompanyIntelligenceInterfaceProps {}

const CompanyIntelligenceInterface: React.FC<CompanyIntelligenceInterfaceProps> = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'ai'}>>([]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const userMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user' as const
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'll help you analyze Philippine companies. Let me search our database...",
        sender: 'ai' as const
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 h-96 flex flex-col">
      {/* Suggested questions */}
      <div className="p-6 border-b border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm text-left transition-colors">
            Hey Kairos, show me the companies in the most trouble
          </button>
          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm text-left transition-colors">
            Which companies are struggling with digital transformation?
          </button>
          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm text-left transition-colors">
            Tell me about the banking sector crisis
          </button>
          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm text-left transition-colors">
            What's the latest on Philippine Airlines?
          </button>
        </div>
      </div>
      {/* Chat messages area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p>Ask me anything about business events happening...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Message input */}
      <div className="p-6 border-t border-gray-700">
        <div className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about business events happening..."
            className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyIntelligenceInterface; 