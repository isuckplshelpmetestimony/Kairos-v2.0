import React from 'react';

interface SearchToggleProps {
  mode: 'event' | 'company';
  onChange: (mode: 'event' | 'company') => void;
  disabled?: boolean;
}

const SearchToggle: React.FC<SearchToggleProps> = ({ mode, onChange, disabled }) => {
  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex bg-black/30 rounded-full p-1 shadow-lg">
        <button
          className={`px-6 py-2 rounded-full font-semibold transition-colors text-sm focus:outline-none ${mode === 'event' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow' : 'text-blue-200 hover:bg-white/10'}`}
          onClick={() => onChange('event')}
          disabled={disabled || mode === 'event'}
          aria-pressed={mode === 'event'}
        >
          Event Search
        </button>
        <button
          className={`px-6 py-2 rounded-full font-semibold transition-colors text-sm focus:outline-none ${mode === 'company' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow' : 'text-blue-200 hover:bg-white/10'}`}
          onClick={() => onChange('company')}
          disabled={disabled || mode === 'company'}
          aria-pressed={mode === 'company'}
        >
          Company Intelligence
        </button>
      </div>
    </div>
  );
};

export default SearchToggle; 