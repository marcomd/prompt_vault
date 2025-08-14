import { type PromptLog, type InsertPromptLog } from "@shared/schema";

export interface IStorage {
  getPromptLog(id: string): Promise<PromptLog | undefined>;
  searchPromptLogs(query: string): Promise<PromptLog[]>;
  getAllPromptLogs(): Promise<PromptLog[]>;
  getRecentPromptLogs(limit?: number): Promise<PromptLog[]>;
  createPromptLog(log: InsertPromptLog): Promise<PromptLog>;
  updatePromptLog(id: string, log: Partial<InsertPromptLog>): Promise<PromptLog | undefined>;
  deletePromptLog(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private logs: Map<string, PromptLog>;
  private counter: number = 1;

  constructor() {
    this.logs = new Map();
  }

  private generateId(): string {
    const year = new Date().getFullYear();
    const sequence = String(this.counter++).padStart(3, '0');
    return `LOG-${year}-${sequence}`;
  }

  async getPromptLog(id: string): Promise<PromptLog | undefined> {
    return this.logs.get(id);
  }

  async searchPromptLogs(query: string): Promise<PromptLog[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.logs.values()).filter(log =>
      log.id.toLowerCase().includes(searchTerm) ||
      log.prUrl.toLowerCase().includes(searchTerm) ||
      log.authorEmail.toLowerCase().includes(searchTerm) ||
      log.orchestrator.toLowerCase().includes(searchTerm) ||
      log.llm.toLowerCase().includes(searchTerm) ||
      (log.tags && log.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
      log.content.toLowerCase().includes(searchTerm)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllPromptLogs(): Promise<PromptLog[]> {
    return Array.from(this.logs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getRecentPromptLogs(limit: number = 10): Promise<PromptLog[]> {
    return Array.from(this.logs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createPromptLog(insertLog: InsertPromptLog): Promise<PromptLog> {
    const id = insertLog.id || this.generateId();
    const now = new Date();
    
    const log: PromptLog = {
      ...insertLog,
      id,
      branch: insertLog.branch || null,
      tags: Array.isArray(insertLog.tags) ? insertLog.tags : [],
      createdAt: now,
      updatedAt: now,
    };

    this.logs.set(id, log);
    return log;
  }

  async updatePromptLog(id: string, updateData: Partial<InsertPromptLog>): Promise<PromptLog | undefined> {
    const existingLog = this.logs.get(id);
    if (!existingLog) {
      return undefined;
    }

    const updatedLog: PromptLog = {
      ...existingLog,
      ...updateData,
      id: existingLog.id, // Ensure ID doesn't change
      tags: updateData.tags ? (Array.isArray(updateData.tags) ? updateData.tags : []) : existingLog.tags,
      updatedAt: new Date(),
    };

    this.logs.set(id, updatedLog);
    return updatedLog;
  }

  async deletePromptLog(id: string): Promise<boolean> {
    return this.logs.delete(id);
  }
}

export const storage = new MemStorage();
