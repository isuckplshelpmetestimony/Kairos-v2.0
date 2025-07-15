import * as React from "react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search } from "lucide-react";
import { INDUSTRIES, COMPANY_STAGES } from "../lib/types";
import type { SearchFilters } from "../lib/types";

interface SearchSectionProps {
  onSearch: (filters: SearchFilters) => void;
}

export default function SearchSection({ onSearch }: SearchSectionProps) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [companyStage, setCompanyStage] = useState("");

  const handleSearch = () => {
    onSearch({
      query: query || undefined,
      industry: industry && industry !== "all" ? industry : undefined,
      companyStage: companyStage && companyStage !== "all" ? companyStage : undefined,
    });
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-[2]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Event Title, Keywords, Company..."
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <Select value={industry || "all"} onValueChange={setIndustry}>
          <SelectTrigger className="md:w-[140px] py-3 border-gray-300 rounded-md text-sm">
            <SelectValue placeholder="All industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All industries</SelectItem>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind.value} value={ind.value}>
                {ind.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={companyStage || "all"} onValueChange={setCompanyStage}>
          <SelectTrigger className="md:w-[140px] py-3 border-gray-300 rounded-md text-sm">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {COMPANY_STAGES.map((stage) => (
              <SelectItem key={stage.value} value={stage.value}>
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
        >
          Find Events
        </Button>
      </div>
    </div>
  );
}
