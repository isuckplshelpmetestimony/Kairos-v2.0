import React, { useState } from 'react';
import { SearchFilters } from '../lib/types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';
import { Search } from 'lucide-react';

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

const newCompanyStageOptions = [
  "All categories",
  "🔥 Active Challenges (problems happening now)",
  "🔍 Exploring Solutions (aware and researching)",
  "📋 Planning Transformation (ready to execute)"
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
    <form
      className="glass-effect p-6 max-w-4xl mx-auto"
      onSubmit={handleSearch}
    >
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <Input
            type="text"
            placeholder="Event Title, Keywords, Company..."
            className="pl-12 pr-4 py-4 text-lg rounded-lg input-premium placeholder-white/70"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search events"
          />
        </div>

        {/* Industry Filter */}
        <div className="w-full md:w-[180px]">
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger 
              aria-label="Filter by industry" 
              className="rounded-lg h-14 text-base input-premium"
            >
              <SelectValue placeholder="All industries" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {industries.map(ind => (
                <SelectItem key={ind} value={ind} className="text-white hover:bg-gray-700">
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Company Stage Filter */}
        <div className="w-full md:w-[180px]">
          <Select value={companyStage} onValueChange={setCompanyStage}>
            <SelectTrigger 
              aria-label="Filter by company readiness" 
              className="rounded-lg h-14 text-base input-premium"
            >
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {newCompanyStageOptions.map(stage => (
                <SelectItem key={stage} value={stage} className="text-white hover:bg-gray-700">
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Find Events Button */}
        <Button 
          type="submit" 
          className="w-full md:w-auto px-8 py-4 text-base rounded-lg h-14 btn-premium"
        >
          Find Events
        </Button>
      </div>
    </form>
  );
}
