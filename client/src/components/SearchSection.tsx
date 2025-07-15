import React, { useState } from 'react';
import { SearchFilters } from '../lib/types';

interface SearchSectionProps {
  onSearch: (filters: SearchFilters) => void;
}

const industries = [
  'All industries',
  'Technology',
  'Government & Public Sector',
  'Retail & E-commerce',
  'Banking & Financial Services',
];

const companyStages = [
  'All categories',
  'Pre-seed Startups',
  'Seed Stage',
  'Series A',
  'Series B+',
  'Growth Stage',
  'SMEs',
  'Large Enterprises',
  'Multinational Corporations',
];

export default function SearchSection({ onSearch }: SearchSectionProps) {
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('All industries');
  const [companyStage, setCompanyStage] = useState('All categories');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch({ query, industry, companyStage });
  };

  return (
    <form className="mb-8 flex flex-col md:flex-row gap-4 items-center" onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Search events, attendees, or goals..."
        className="w-full md:w-1/3 px-4 py-2 border rounded focus:outline-none focus:ring"
        value={query}
        onChange={e => setQuery(e.target.value)}
        aria-label="Search events"
      />
      <select
        className="w-full md:w-1/4 px-4 py-2 border rounded focus:outline-none"
        value={industry}
        onChange={e => setIndustry(e.target.value)}
        aria-label="Filter by industry"
      >
        {industries.map(ind => (
          <option key={ind} value={ind}>{ind}</option>
        ))}
      </select>
      <select
        className="w-full md:w-1/4 px-4 py-2 border rounded focus:outline-none"
        value={companyStage}
        onChange={e => setCompanyStage(e.target.value)}
        aria-label="Filter by company stage"
      >
        {companyStages.map(stage => (
          <option key={stage} value={stage}>{stage}</option>
        ))}
      </select>
      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        aria-label="Find Events"
      >
        Find Events
      </button>
    </form>
  );
}
