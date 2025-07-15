import { useState } from "react";
import Header from "@/components/Header";
import SearchSection from "@/components/SearchSection";
import FeaturedEvents from "@/components/FeaturedEvents";
import { Button } from "@/components/ui/button";
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
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Discover Business Events for<br />
            <span className="text-primary">Strategic Networking</span>
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Find relevant business events in the Philippines where your ideal clients attend. 
            Stop cold calling—start strategic networking.
          </p>

          <SearchSection onSearch={handleSearch} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-slate-600">Business Events</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">15+</div>
              <div className="text-slate-600">Industries Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <div className="text-slate-600">Companies Connected</div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedEvents searchFilters={searchFilters} />

      {/* CTA Section */}
      <section className="bg-primary py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Networking Strategy?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of digital transformation companies already using Kairos v2.0 to discover strategic networking opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-primary px-8 py-4 rounded-xl font-medium hover:bg-blue-50">
              Start Free Trial
            </Button>
            <Button variant="outline" className="border-2 border-white text-white px-8 py-4 rounded-xl font-medium hover:bg-white hover:text-primary">
              Request Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-calendar-alt text-white text-lg"></i>
                </div>
                <span className="text-xl font-semibold text-white">Kairos v2.0</span>
              </div>
              <p className="text-slate-400 mb-4 max-w-md">
                The premier platform for digital transformation companies to discover strategic business networking opportunities in the Philippines.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Browse Events</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Industries</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Company Stages</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 Kairos v2.0. All rights reserved.
            </p>
            <p className="text-slate-400 text-sm mt-2 sm:mt-0">
              Made for Philippine businesses
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
