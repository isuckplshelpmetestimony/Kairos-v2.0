import React from 'react';
import SearchSection from './SearchSection';
import { SearchFilters } from '../lib/types';

interface HeroProps {
  onSearch: (filters: SearchFilters) => void;
}

const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-black/80"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* AI-Powered Tag */}
        <div className="inline-flex items-center space-x-2 bg-gray-800/50 border border-purple-400/30 rounded-full px-4 py-2 mb-8">
          <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <span className="text-white text-sm font-medium">AI-Powered Event Discovery</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          The all-in-one professional events platform for{' '}
          <span className="text-blue-400">founders</span>
        </h1>

        {/* Description */}
        <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
          Connect with professional events that count. KAIROS creates the difference with smart recommendations, premium networking opportunities, and curated experiences.
        </p>

        {/* Search Interface */}
        <div className="max-w-4xl mx-auto">
          <SearchSection onSearch={onSearch} />
        </div>
      </div>
    </section>
  );
};

export default Hero; 