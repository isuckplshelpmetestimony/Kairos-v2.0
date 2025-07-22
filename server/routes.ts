import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema } from "@shared/schema";
import { z } from "zod";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import paymentRoutes from "./routes/payments.js";
import axios from "axios";

const searchParamsSchema = z.object({
  query: z.string().optional(),
  industry: z.string().optional(),
  companyStage: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Register API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/payments", paymentRoutes);

  // Get all events with optional filtering
  app.get("/api/events", async (req, res) => {
    try {
      const params = searchParamsSchema.parse(req.query);
      const events = await storage.getEvents(params);
      res.json({ events, total: events.length });
    } catch (error) {
      res.status(400).json({ message: "Invalid query parameters" });
    }
  });

  // Get featured events
  app.get("/api/events/featured", async (req, res) => {
    try {
      const events = await storage.getFeaturedEvents();
      res.json({ events });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured events" });
    }
  });

  // Create a new event
  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  // Get event by ID
  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Proxy route to Firecrawl
  app.post("/api/firecrawl/proxy", async (req, res) => {
    try {
      const firecrawlUrl = process.env.FIRECRAWL_URL || "http://localhost:3002";
      const { endpoint, method = "POST", data = {}, params = {} } = req.body;
      const url = `${firecrawlUrl}${endpoint}`;
      const response = await axios({
        url,
        method,
        data,
        params,
        headers: req.headers, // Forward headers (optionally filter)
      });
      res.status(response.status).json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        message: error.message,
        details: error.response?.data || null,
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
