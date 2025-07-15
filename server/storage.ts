import { users, events, type User, type InsertUser, type Event, type InsertEvent } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and } from "drizzle-orm";
import type { SearchFilters } from "@/lib/types";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getEvents(filters: SearchFilters): Promise<Event[]>;
  getFeaturedEvents(): Promise<Event[]>;
  createEvent(insertEvent: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<Event | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getEvents(filters: SearchFilters): Promise<Event[]> {
    const conditions = [];
    
    if (filters.query) {
      conditions.push(ilike(events.eventName, `%${filters.query}%`));
    }
    
    if (filters.industry) {
      conditions.push(eq(events.industry, filters.industry));
    }
    
    if (filters.companyStage) {
      // Check if the company stage exists in the array
      conditions.push(ilike(events.companyStages, `%${filters.companyStage}%`));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    return await db.select().from(events).where(whereClause);
  }

  async getFeaturedEvents(): Promise<Event[]> {
    // Return first 6 events as featured for now
    return await db.select().from(events).limit(6);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }
}

export const storage = new DatabaseStorage();