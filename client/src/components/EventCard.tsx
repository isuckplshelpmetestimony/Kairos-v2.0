import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink } from "lucide-react";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
}

const getIndustryColor = (industry: string) => {
  const colors: Record<string, string> = {
    technology: "bg-blue-600/20 text-blue-400 border-blue-600/30",
    government: "bg-purple-600/20 text-purple-400 border-purple-600/30", 
    retail: "bg-orange-600/20 text-orange-400 border-orange-600/30",
    banking: "bg-green-600/20 text-green-400 border-green-600/30",
  };
  return colors[industry] || "bg-secondary text-secondary-foreground border-border";
};

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-card-foreground mb-2 leading-tight">
            {event.eventName}
          </h3>
          <div className="text-sm text-muted-foreground mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {event.dateLocation}
          </div>
        </div>
        <Badge className={`text-xs font-medium px-3 py-1 rounded-full ${getIndustryColor(event.industry)}`}>
          {event.industry.charAt(0).toUpperCase() + event.industry.slice(1)}
        </Badge>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="text-sm">
          <span className="font-medium text-card-foreground">👥 Attendees:</span>
          <span className="text-muted-foreground ml-1">{event.attendeeTypes}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-card-foreground">🎯 Goals:</span>
          <span className="text-muted-foreground ml-1">{event.goalsServed}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {event.companyStages.slice(0, 2).map((stage, index) => (
            <Badge key={index} className="bg-secondary text-secondary-foreground text-xs px-2 py-1">
              {stage}
            </Badge>
          ))}
          {event.companyStages.length > 2 && (
            <Badge className="bg-secondary text-secondary-foreground text-xs px-2 py-1">
              +{event.companyStages.length - 2}
            </Badge>
          )}
        </div>
        {event.sourceUrl && (
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Visit Event Page
          </button>
        )}
      </div>
    </div>
  );
}
