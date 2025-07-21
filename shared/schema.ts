import { pgTable, text, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  eventName: varchar("event_name", { length: 255 }).notNull(),
  dateLocation: text("date_location").notNull(),
  attendeeTypes: text("attendee_types").notNull(),
  goalsServed: varchar("goals_served", { length: 255 }).notNull(),
  sourceUrl: text("source_url"),
  industry: varchar("industry", { length: 100 }).notNull(),
  companyStages: text("company_stages").array().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Crisis Intelligence Types
export type CrisisCategory = 'active_challenges' | 'exploring_solutions' | 'planning_transformation';

export type SignalType =
  | 'financial_distress'
  | 'leadership_change'
  | 'layoffs'
  | 'budget_cuts'
  | 'website_redesign'
  | 'job_postings'
  | 'press_releases'
  | 'conference_speaking'
  | 'event_attendance'
  | 'vendor_evaluation'
  | 'solution_research'
  | 'regulatory_change'
  | 'competitor_threat'
  | 'market_disruption';

export type SeniorityLevel = 'c_suite' | 'vp_level' | 'director_level' | 'manager_level' | 'individual_contributor';

export type MessageType = 'user_question' | 'ai_response' | 'system_notification';

export interface CrisisCompany {
  id: number;
  company_name: string;
  company_domain: string | null;
  industry_sector: string;
  employee_count: number | null;
  annual_revenue: number | null;
  headquarters_location: string | null;
  crisis_score: number;
  crisis_category: CrisisCategory;
  crisis_confidence_level: number;
  last_intelligence_update: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrisisSignal {
  id: number;
  company_id: number;
  signal_type: SignalType;
  signal_title: string;
  signal_description: string;
  signal_source: string;
  signal_url: string | null;
  signal_date: string;
  impact_weight: number;
  confidence_score: number;
  temporal_relevance: number;
  created_at: string;
}

export interface CompanyDecisionMaker {
  id: number;
  company_id: number;
  full_name: string;
  job_title: string;
  department: string | null;
  seniority_level: SeniorityLevel;
  email_address: string | null;
  phone_number: string | null;
  linkedin_profile: string | null;
  decision_authority_level: number;
  transformation_influence_score: number;
  last_contact_attempt: string | null;
  contact_success_rate: number;
  is_primary_contact: boolean;
  created_at: string;
}

export interface CrisisChatMessage {
  id: number;
  company_id: number;
  user_id: number;
  message_content: string;
  message_type: MessageType;
  ai_context_used: string | null;
  response_time_ms: number | null;
  user_satisfaction_rating: number | null;
  created_at: string;
}

// API Response Types
export interface CompaniesResponse {
  companies: CrisisCompany[];
  total_count: number;
  has_more: boolean;
  filters_applied: {
    industry?: string[];
    category?: CrisisCategory[];
    score_range?: [number, number];
  };
}

export interface CompanyDetailsResponse {
  company: CrisisCompany;
  crisis_signals: CrisisSignal[];
  decision_makers: CompanyDecisionMaker[];
  crisis_timeline: Array<{
    date: string;
    events: string[];
    crisis_score_change: number;
  }>;
}

export interface ChatResponse {
  ai_response: string;
  context_sources: string[];
  confidence_level: number;
  suggested_followups: string[];
  response_time_ms: number;
  conversation_id: number;
}
