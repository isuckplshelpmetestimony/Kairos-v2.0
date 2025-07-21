import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { isPremium } = useAuth();

  return (
    <header className="w-full py-4 px-8 flex items-center justify-between bg-black/60 backdrop-blur-md shadow-md fixed top-0 left-0 z-50">
      <a href="/" className="text-2xl font-bold text-white tracking-wide">KAIROS</a>
      <nav className="flex gap-6 items-center">
        {isPremium() && (
          <a href="/crisis-intelligence" className="text-white hover:text-blue-400 font-medium transition-colors">
            Crisis Intelligence
          </a>
        )}
        {/* Add other nav links here */}
      </nav>
    </header>
  );
};

export default Header;
