import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "./EventCard";
import type { SearchFilters, EventsResponse } from "@/lib/types";
import type { Event } from "@shared/schema";

interface FeaturedEventsProps {
  searchFilters: SearchFilters;
}

export default function FeaturedEvents({ searchFilters }: FeaturedEventsProps) {
  const hasFilters = Object.values(searchFilters).some(Boolean);
  
  // Use search results if filters are applied, otherwise show featured events
  const { data, isLoading, error } = useQuery<EventsResponse>({
    queryKey: hasFilters 
      ? ["/api/events", searchFilters] 
      : ["/api/events/featured"],
    enabled: true,
  });

  const events = data?.events || [];
  const sectionTitle = hasFilters ? "Search Results" : "Featured Events";
  const sectionDescription = hasFilters 
    ? `Found ${events.length} events matching your criteria`
    : "Handpicked networking opportunities for digital transformation companies";

  if (error) {
    return (
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-600">Failed to load events. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">{sectionTitle}</h2>
        </div>

        {hasFilters ? (
          // Show search results
          isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg mb-4">
                No events found matching your criteria.
              </p>
              <p className="text-slate-500">
                Try adjusting your search filters or search terms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: Event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )
        ) : (
          // Show featured companies (like BetterInternship)
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center justify-center w-24 h-16 bg-gray-100 rounded border">
              <span className="text-xs font-medium text-gray-500">Ayala</span>
            </div>
            <div className="flex items-center justify-center w-24 h-16 bg-gray-100 rounded border">
              <span className="text-xs font-medium text-gray-500">BPI</span>
            </div>
            <div className="flex items-center justify-center w-24 h-16 bg-gray-100 rounded border">
              <span className="text-xs font-medium text-gray-500">Globe</span>
            </div>
            <div className="flex items-center justify-center w-24 h-16 bg-gray-100 rounded border">
              <span className="text-xs font-medium text-gray-500">PLDT</span>
            </div>
            <div className="flex items-center justify-center w-24 h-16 bg-gray-100 rounded border">
              <span className="text-xs font-medium text-gray-500">SM Group</span>
            </div>
            <div className="flex items-center justify-center w-24 h-16 bg-gray-100 rounded border">
              <span className="text-xs font-medium text-gray-500">Jollibee</span>
            </div>
            <div className="flex items-center justify-center w-24 h-16 bg-gray-100 rounded border">
              <span className="text-xs font-medium text-gray-500">ABS-CBN</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
