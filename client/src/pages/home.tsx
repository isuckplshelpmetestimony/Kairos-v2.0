import * as React from "react";
import { useState } from "react";
import Header from "../components/Header";
import SearchSection from "../components/SearchSection";
import FeaturedEvents from "../components/FeaturedEvents";
import type { SearchFilters } from "../lib/types";

export default function Home() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Content */}
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Discover Business Events for Strategic Networking
          </h1>
          <p className="text-lg text-slate-600 mb-12">
            Find networking opportunities where your target clients attend in the Philippines
          </p>

          <SearchSection onSearch={handleSearch} />
        </div>
      </main>

      <FeaturedEvents searchFilters={searchFilters} />

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            © 2025 Kairos v2.0. All rights reserved. Terms & Conditions and Privacy Policy.
          </p>
        </div>
      </footer>
    </div>
  );
}
