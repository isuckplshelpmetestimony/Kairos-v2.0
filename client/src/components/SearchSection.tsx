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
      className="bg-white rounded-xl shadow p-8 max-w-4xl mx-auto mb-10"
      onSubmit={handleSearch}
    >
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-6 h-6" />
          </span>
          <Input
            type="text"
            placeholder="Event Title, Keywords, Company..."
            className="pl-12 pr-4 py-4 text-lg rounded-xl"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search events"
          />
        </div>
        <div className="w-full md:w-[180px]">
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger aria-label="Filter by industry" className="rounded-xl h-14 text-base">
              <SelectValue placeholder="All industries" />
            </SelectTrigger>
            <SelectContent>
              {industries.map(ind => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-[180px]">
          <Select value={companyStage} onValueChange={setCompanyStage}>
            <SelectTrigger aria-label="Filter by company readiness" className="rounded-xl h-14 text-base">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {newCompanyStageOptions.map(stage => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full md:w-auto px-8 py-4 text-base rounded-xl h-14">
          Find Events
        </Button>
      </div>
    </form>
  );
}
