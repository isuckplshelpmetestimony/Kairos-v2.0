import React from 'react';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions, activeSessionId, onNewChat, onSelectChat
}) => (
  <aside className="bg-slate-900 border-r border-slate-800 w-64 min-h-screen flex flex-col">
    <div className="p-4 border-b border-slate-800">
      <button
        className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-semibold shadow"
        onClick={onNewChat}
      >
        + New Chat
      </button>
    </div>
    <nav className="flex-1 overflow-y-auto">
      {sessions.map(session => (
        <div
          key={session.id}
          className={`px-4 py-3 cursor-pointer hover:bg-slate-800 transition ${
            session.id === activeSessionId ? 'bg-slate-800 text-purple-400 font-bold' : 'text-white'
          }`}
          onClick={() => onSelectChat(session.id)}
        >
          {session.title || `Chat ${session.createdAt.slice(0, 10)}`}
        </div>
      ))}
    </nav>
  </aside>
);

export default ChatSidebar; 