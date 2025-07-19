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

const eventTypes = [
  'All Types',
  'Networking',
  'Conference',
  'Workshop',
  'Meetup',
  'Webinar',
];

const topics = [
  'Topic',
  'Technology',
  'Business',
  'Marketing',
  'Finance',
  'Healthcare',
  'Education',
];

export default function SearchSection({ onSearch }: SearchSectionProps) {
  const [query, setQuery] = useState('');
  const [eventType, setEventType] = useState('All Types');
  const [topic, setTopic] = useState('Topic');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch({ 
      query, 
      industry: eventType, 
      companyStage: topic 
    });
  };

  return (
    <form
      className="bg-gray-900/50 backdrop-blur-sm border border-purple-400/30 rounded-xl shadow-2xl p-6 max-w-4xl mx-auto"
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
            placeholder="Search events, topics, or locations..."
            className="pl-12 pr-4 py-4 text-lg rounded-lg bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search events"
          />
        </div>

        {/* Event Type Filter */}
        <div className="w-full md:w-[140px]">
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger 
              aria-label="Filter by event type" 
              className="rounded-lg h-14 text-base bg-gray-800/50 border-gray-600 text-white focus:border-purple-400 focus:ring-purple-400"
            >
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {eventTypes.map(type => (
                <SelectItem key={type} value={type} className="text-white hover:bg-gray-700">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Topic Filter */}
        <div className="w-full md:w-[140px]">
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger 
              aria-label="Filter by topic" 
              className="rounded-lg h-14 text-base bg-gray-800/50 border-gray-600 text-white focus:border-purple-400 focus:ring-purple-400"
            >
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {topics.map(topicItem => (
                <SelectItem key={topicItem} value={topicItem} className="text-white hover:bg-gray-700">
                  {topicItem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Find Events Button */}
        <Button 
          type="submit" 
          className="w-full md:w-auto px-8 py-4 text-base rounded-lg h-14 bg-purple-600 hover:bg-purple-700 text-white font-medium"
        >
          Find Events
        </Button>
      </div>
    </form>
  );
}
