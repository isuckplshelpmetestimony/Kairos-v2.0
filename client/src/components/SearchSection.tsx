import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { INDUSTRIES, COMPANY_STAGES, type SearchFilters } from "@/lib/types";

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
    // Real-time filtering with debounce would be implemented here
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200">
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search events, topics, or keywords..."
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              className="pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent h-auto"
            />
          </div>
        </div>
        
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger className="lg:min-w-[200px] rounded-xl border-slate-200 py-4 h-auto">
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind.value} value={ind.value}>
                {ind.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={companyStage} onValueChange={setCompanyStage}>
          <SelectTrigger className="lg:min-w-[200px] rounded-xl border-slate-200 py-4 h-auto">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {COMPANY_STAGES.map((stage) => (
              <SelectItem key={stage.value} value={stage.value}>
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={handleSearch}
        className="w-full lg:w-auto bg-primary text-white px-8 py-4 rounded-xl font-medium hover:bg-blue-700"
      >
        <Search className="w-5 h-5 mr-2" />
        Find Events
      </Button>
    </div>
  );
}
