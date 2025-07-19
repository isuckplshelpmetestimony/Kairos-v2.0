import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white tracking-wider">
              KAIROS
            </h1>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-white/80 text-sm">
                  Welcome, {user.email}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="px-4 py-2 text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
                  Contact Us
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  Join Waitlist
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
