import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPromptLogSchema } from "@shared/schema";
import { setupAuth, isAuthenticated, allowReadOnlyAccess } from "./auth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all logs (read-only access allowed)
  app.get("/api/logs", allowReadOnlyAccess, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const logs = await storage.getAllPromptLogs(userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  // Get recent logs (read-only access allowed)
  app.get("/api/logs/recent", allowReadOnlyAccess, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const userId = req.user?.id;
      const logs = await storage.getRecentPromptLogs(limit, userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent logs" });
    }
  });

  // Search logs (read-only access allowed)
  app.get("/api/logs/search", allowReadOnlyAccess, async (req: any, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const userId = req.user?.id;
      const logs = await storage.searchPromptLogs(query, userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to search logs" });
    }
  });

  // Get log by ID (read-only access allowed)
  app.get("/api/logs/:id", allowReadOnlyAccess, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const log = await storage.getPromptLog(req.params.id, userId);
      if (!log) {
        return res.status(404).json({ error: "Log not found" });
      }
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch log" });
    }
  });

  // Create new log
  app.post("/api/logs", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertPromptLogSchema.parse(req.body);
      const logDataWithUser = {
        ...validatedData,
        userId: req.user?.id,
      };
      const log = await storage.createPromptLog(logDataWithUser);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create log" });
    }
  });

  // Update log
  app.put("/api/logs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertPromptLogSchema.partial().parse(req.body);
      const userId = req.user?.id;
      const log = await storage.updatePromptLog(req.params.id, validatedData, userId);
      
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
  app.delete("/api/logs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const deleted = await storage.deletePromptLog(req.params.id, userId);
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
