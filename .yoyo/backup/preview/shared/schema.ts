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
