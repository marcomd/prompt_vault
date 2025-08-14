import {
  users,
  promptLogs,
  type User,
  type UpsertUser,
  type PromptLog,
  type InsertPromptLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for OAuth authentication.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Log operations
  getPromptLog(id: string, userId?: string): Promise<PromptLog | undefined>;
  searchPromptLogs(query: string, userId?: string): Promise<PromptLog[]>;
  getAllPromptLogs(userId?: string): Promise<PromptLog[]>;
  getRecentPromptLogs(limit: number, userId?: string): Promise<PromptLog[]>;
  createPromptLog(log: InsertPromptLog): Promise<PromptLog>;
  updatePromptLog(id: string, log: Partial<InsertPromptLog>, userId?: string): Promise<PromptLog | undefined>;
  deletePromptLog(id: string, userId?: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for OAuth authentication.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Log operations
  private generateId(): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `LOG-${year}-${timestamp}`;
  }

  async getPromptLog(id: string, userId?: string): Promise<PromptLog | undefined> {
    const conditions = [eq(promptLogs.id, id)];
    if (userId) {
      conditions.push(eq(promptLogs.userId, userId));
    }
    
    const [log] = await db
      .select()
      .from(promptLogs)
      .where(and(...conditions));
    return log;
  }

  async searchPromptLogs(query: string, userId?: string): Promise<PromptLog[]> {
    const searchPattern = `%${query}%`;
    const conditions = [
      or(
        ilike(promptLogs.content, searchPattern),
        ilike(promptLogs.prUrl, searchPattern),
        ilike(promptLogs.authorEmail, searchPattern),
        ilike(promptLogs.orchestrator, searchPattern),
        ilike(promptLogs.llm, searchPattern),
        ilike(promptLogs.branch, searchPattern)
      )
    ];
    
    if (userId) {
      conditions.push(eq(promptLogs.userId, userId));
    }
    
    return await db
      .select()
      .from(promptLogs)
      .where(and(...conditions))
      .orderBy(desc(promptLogs.createdAt));
  }

  async getAllPromptLogs(userId?: string): Promise<PromptLog[]> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(promptLogs.userId, userId));
    }
    
    return await db
      .select()
      .from(promptLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(promptLogs.createdAt));
  }

  async getRecentPromptLogs(limit: number, userId?: string): Promise<PromptLog[]> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(promptLogs.userId, userId));
    }
    
    return await db
      .select()
      .from(promptLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(promptLogs.createdAt))
      .limit(limit);
  }

  async createPromptLog(logData: InsertPromptLog): Promise<PromptLog> {
    const id = logData.id || this.generateId();
    const [log] = await db
      .insert(promptLogs)
      .values({
        ...logData,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return log;
  }

  async updatePromptLog(id: string, logData: Partial<InsertPromptLog>, userId?: string): Promise<PromptLog | undefined> {
    const conditions = [eq(promptLogs.id, id)];
    if (userId) {
      conditions.push(eq(promptLogs.userId, userId));
    }
    
    const [log] = await db
      .update(promptLogs)
      .set({
        ...logData,
        updatedAt: new Date(),
      })
      .where(and(...conditions))
      .returning();
    
    return log;
  }

  async deletePromptLog(id: string, userId?: string): Promise<boolean> {
    const conditions = [eq(promptLogs.id, id)];
    if (userId) {
      conditions.push(eq(promptLogs.userId, userId));
    }
    
    const result = await db
      .delete(promptLogs)
      .where(and(...conditions));
    
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();