import { pgTable, text, serial, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scansTable = pgTable("scans", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  imageData: text("image_data"),
  drStage: integer("dr_stage").notNull(),
  confidenceScore: real("confidence_score").notNull(),
  riskLevel: text("risk_level").notNull(),
  blindnessRiskScore: integer("blindness_risk_score").notNull(),
  heatmapData: text("heatmap_data"),
  doctorConfirmed: boolean("doctor_confirmed").default(false).notNull(),
  doctorNotes: text("doctor_notes"),
  doctorId: text("doctor_id"),
  recommendation: text("recommendation").notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertScanSchema = createInsertSchema(scansTable).omit({ id: true, createdAt: true });
export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scansTable.$inferSelect;
