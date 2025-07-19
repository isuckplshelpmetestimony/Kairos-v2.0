export interface Event {
  id: string;
  eventName: string;
  dateLocation: string;
  attendees: string;
  goals: string;
  sourceUrl: string;
  primaryIndustry: string;
  secondaryIndustry?: string;
  companyStages: string[]; // Keep original for reference
  companyReadiness: string; // NEW - mapped readiness level
  eventType: string;
  featured: boolean;
}

export interface SearchFilters {
  query: string;
  industry: string;
  companyStage: string; // Now represents readiness
}

export interface EventsResponse {
  events: Event[];
  total: number;
}

export const INDUSTRIES = [
  { value: "technology", label: "Technology" },
  { value: "government", label: "Government & Public Sector" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "banking", label: "Banking & Financial Services" },
];

export const COMPANY_STAGES = [
  { value: "pre-seed", label: "Pre-seed Startups" },
  { value: "seed", label: "Seed Stage" },
  { value: "series-a", label: "Series A" },
  { value: "series-b", label: "Series B+" },
  { value: "growth", label: "Growth Stage" },
  { value: "sme", label: "SMEs" },
  { value: "large", label: "Large Enterprises" },
  { value: "multinational", label: "Multinational Corporations" },
];
