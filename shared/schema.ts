import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const promptLogs = pgTable("prompt_logs", {
  id: varchar("id").primaryKey(),
  prUrl: text("pr_url").notNull(),
  branch: text("branch"),
  authorEmail: text("author_email").notNull(),
  orchestrator: text("orchestrator").notNull(),
  llm: text("llm").notNull(),
  tags: text("tags").array().default(sql`'{}'::text[]`),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPromptLogSchema = createInsertSchema(promptLogs).omit({
  createdAt: true,
  updatedAt: true,
}).extend({
  tags: z.string().optional().transform((val) => 
    val ? val.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
  ),
});

export type InsertPromptLog = z.infer<typeof insertPromptLogSchema>;
export type PromptLog = typeof promptLogs.$inferSelect;
