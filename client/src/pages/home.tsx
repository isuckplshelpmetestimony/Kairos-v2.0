import { useState } from "react";
import Header from "@/components/Header";
import FeaturedEvents from "@/components/FeaturedEvents";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { SearchFilters } from "@/lib/types";

export default function Home() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <Badge className="bg-secondary border border-border text-secondary-foreground px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Event Discovery
            </Badge>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            The all-in-one <span className="text-primary">startup events</span> platform for founders
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect with startup events that count. KAIROS creates the difference with 
            smart recommendations, premium networking opportunities, and curated 
            experiences.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground px-4 py-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              AI Matching
            </Badge>
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground px-4 py-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Premium Network
            </Badge>
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground px-4 py-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Smart Calendar
            </Badge>
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground px-4 py-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Growth Events
            </Badge>
          </div>

          {/* Categories */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-foreground mb-6">All Categories</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge className="bg-primary text-primary-foreground px-4 py-2">All</Badge>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground px-4 py-2">FinTech</Badge>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground px-4 py-2">AI</Badge>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground px-4 py-2">Hackathons</Badge>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground px-4 py-2">Design</Badge>
            </div>
          </div>
        </div>
      </section>

      <FeaturedEvents searchFilters={searchFilters} />
    </div>
  );
}
