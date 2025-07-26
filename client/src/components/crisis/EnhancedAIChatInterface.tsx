import React, { useState, useEffect, useRef } from 'react';

interface ChatStatus {
  message: string;
  type: string;
  progress: number;
  timestamp: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  sources?: any[];
  followups?: string[];
}

export const EnhancedAIChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ChatStatus | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  // Status polling effect
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (isLoading) {
      pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/status/${sessionId}`);
          const status = await response.json();
          setCurrentStatus(status);
        } catch (error) {
          console.error('Status polling error:', error);
        }
      }, 1000); // Poll every second
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isLoading, sessionId]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/crisis/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: currentMessage,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.ai_response,
        timestamp: new Date(),
        sources: data.sources_used,
        followups: data.suggested_followups
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setCurrentStatus(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        {/* Enhanced Header */}
        <div className="p-6 border-b border-white/20 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mr-3 flex items-center justify-center text-white font-bold text-sm">
                  K
                </span>
                Kairos Business Consultant
              </h2>
              <p className="text-gray-300">Philippine Market Expert • Digital Transformation Strategist</p>
            </div>
          </div>
        </div>
        {/* Messages Area with Enhanced Status */}
        <div className="h-[40rem] overflow-y-auto p-6 space-y-4">
          {/* Enhanced Status Indicator */}
          {isLoading && currentStatus && (
            <div className="flex justify-start">
              <div className="bg-blue-600/20 border border-blue-400/30 rounded-2xl px-6 py-4 max-w-2xl">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <div className="flex-1">
                    <span className="text-blue-300 text-sm font-medium block">{currentStatus.message}</span>
                    {currentStatus.progress > 0 && (
                      <div className="w-full bg-blue-900/30 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-blue-400 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${currentStatus.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Message Display */}
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-4xl px-6 py-4 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-100 border border-white/20 shadow-lg'
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                {/* Show sources if available */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="text-xs text-gray-400 mb-2">Sources used:</div>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((source: any, index: number) => (
                        <span key={index} className="text-xs bg-white/10 px-2 py-1 rounded">
                          {source.title || 'Web Source'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Follow-up suggestions */}
                {message.followups && message.followups.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="text-xs text-gray-400 mb-2">Follow-up questions:</div>
                    <div className="space-y-1">
                      {message.followups.map((followup: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setInputValue(followup)}
                          className="block text-xs text-blue-300 hover:text-blue-200 text-left hover:underline"
                        >
                          • {followup}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className={`text-xs mt-3 opacity-70`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Enhanced Input */}
        <div className="p-6 border-t border-white/20 bg-white/5">
          <div className="flex space-x-4">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Ask me about Philippine market strategy, digital transformation, company analysis..."
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
              rows={3}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Consult'
              )}
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Press Enter to send • Shift + Enter for new line
          </div>
        </div>
      </div>
      {/* Stats Footer */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
          <div className="text-2xl font-bold text-blue-400">93+</div>
          <div className="text-sm text-gray-400">Companies Tracked</div>
        </div>
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
          <div className="text-2xl font-bold text-orange-400">Real-time</div>
          <div className="text-sm text-gray-400">Market Intelligence</div>
        </div>
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
          <div className="text-2xl font-bold text-green-400">Expert</div>
          <div className="text-sm text-gray-400">Strategic Advice</div>
        </div>
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
          <div className="text-2xl font-bold text-purple-400">AI-Powered</div>
          <div className="text-sm text-gray-400">Predictions</div>
        </div>
      </div>
    </div>
  );
}; 