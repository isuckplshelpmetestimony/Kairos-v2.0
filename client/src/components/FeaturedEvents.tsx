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
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">{sectionTitle}</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {sectionDescription}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg mb-4">
              {hasFilters ? "No events found matching your criteria." : "No featured events available at the moment."}
            </p>
            {hasFilters && (
              <p className="text-slate-500">
                Try adjusting your search filters or search terms.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {events.map((event: Event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {!hasFilters && (
              <div className="text-center">
                <Button variant="secondary" className="px-6 py-3">
                  View All Events
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
