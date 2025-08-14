import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPromptLogSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all logs
  app.get("/api/logs", async (req, res) => {
    try {
      const logs = await storage.getAllPromptLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  // Get recent logs
  app.get("/api/logs/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const logs = await storage.getRecentPromptLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent logs" });
    }
  });

  // Search logs
  app.get("/api/logs/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const logs = await storage.searchPromptLogs(query);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to search logs" });
    }
  });

  // Get log by ID
  app.get("/api/logs/:id", async (req, res) => {
    try {
      const log = await storage.getPromptLog(req.params.id);
      if (!log) {
        return res.status(404).json({ error: "Log not found" });
      }
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch log" });
    }
  });

  // Create new log
  app.post("/api/logs", async (req, res) => {
    try {
      const validatedData = insertPromptLogSchema.parse(req.body);
      const log = await storage.createPromptLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create log" });
    }
  });

  // Update log
  app.put("/api/logs/:id", async (req, res) => {
    try {
      const validatedData = insertPromptLogSchema.partial().parse(req.body);
      const log = await storage.updatePromptLog(req.params.id, validatedData);
      
      if (!log) {
        return res.status(404).json({ error: "Log not found" });
      }
      
      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update log" });
    }
  });

  // Delete log
  app.delete("/api/logs/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePromptLog(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Log not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete log" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
