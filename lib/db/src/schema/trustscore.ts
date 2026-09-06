import { createInsertSchema } from "drizzle-zod";
import { integer, jsonb, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const aiModelsTable = pgTable("ai_models", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull().default(""),
  trustScore: numeric("trust_score").notNull().default("0"),
  metrics: jsonb("metrics").notNull().default({}),
  tests: integer("tests").notNull().default(0),
  lastEvaluated: timestamp("last_evaluated", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const evaluationsTable = pgTable("evaluations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  modelId: uuid("model_id").references(() => aiModelsTable.id).notNull(),
  modelName: text("model_name").notNull(),
  mode: text("mode").notNull(),
  status: text("status").notNull().default("draft"),
  trustScore: numeric("trust_score").notNull().default("0"),
  tests: integer("tests").notNull().default(0),
  passed: integer("passed").notNull().default(0),
  failed: integer("failed").notNull().default(0),
  critical: integer("critical").notNull().default(0),
  hallucinationRate: numeric("hallucination_rate").notNull().default("0"),
  safetyScore: numeric("safety_score").notNull().default("0"),
  biasSignals: integer("bias_signals").notNull().default(0),
  categories: jsonb("categories").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const evaluationResultsTable = pgTable("evaluation_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  evaluationId: uuid("evaluation_id").references(() => evaluationsTable.id).notNull(),
  category: text("category").notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  expectedResponse: text("expected_response").notNull(),
  score: numeric("score").notNull(),
  confidence: numeric("confidence").notNull(),
  passed: integer("passed").notNull().default(0),
  severity: text("severity").notNull(),
  hallucination: text("hallucination").notNull(),
  safety: text("safety").notNull(),
  bias: text("bias").notNull(),
  reason: text("reason").notNull(),
  evidence: text("evidence").notNull(),
  recommendation: text("recommendation").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reportsTable = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  evaluationId: uuid("evaluation_id").references(() => evaluationsTable.id).notNull(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  trustScore: numeric("trust_score").notNull(),
  modelName: text("model_name").notNull(),
  executiveSummary: text("executive_summary").notNull(),
  methodology: text("methodology").notNull(),
  recommendations: jsonb("recommendations").$type<string[]>().notNull().default([]),
  criticalFindings: jsonb("critical_findings").$type<string[]>().notNull().default([]),
  dimensionScores: jsonb("dimension_scores").$type<Record<string, number>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertAiModelSchema = createInsertSchema(aiModelsTable);
export type AiModel = typeof aiModelsTable.$inferSelect;
export type InsertAiModel = z.infer<typeof insertAiModelSchema>;