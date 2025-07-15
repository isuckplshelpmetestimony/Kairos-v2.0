import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink } from "lucide-react";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
}

const getIndustryColor = (industry: string) => {
  const colors: Record<string, string> = {
    technology: "bg-blue-100 text-blue-800",
    government: "bg-purple-100 text-purple-800", 
    retail: "bg-orange-100 text-orange-800",
    banking: "bg-green-100 text-green-800",
  };
  return colors[industry] || "bg-slate-100 text-slate-800";
};

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-2 leading-tight">
            {event.eventName}
          </h3>
          <div className="text-sm text-slate-500 mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {event.dateLocation}
          </div>
        </div>
        <Badge className={`text-xs font-medium px-2 py-1 rounded-full ${getIndustryColor(event.industry)}`}>
          {event.industry.charAt(0).toUpperCase() + event.industry.slice(1)}
        </Badge>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="text-sm">
          <span className="font-medium text-slate-700">Attendees:</span>
          <span className="text-slate-600 ml-1">{event.attendeeTypes}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-slate-700">Goals:</span>
          <span className="text-slate-600 ml-1">{event.goalsServed}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {event.companyStages.slice(0, 2).map((stage, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {stage}
            </Badge>
          ))}
          {event.companyStages.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{event.companyStages.length - 2}
            </Badge>
          )}
        </div>
        {event.sourceUrl && (
          <a 
            href={event.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-blue-700 text-sm font-medium flex items-center"
          >
            View Details <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        )}
      </div>
    </div>
  );
}
