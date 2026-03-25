import { Router, type IRouter } from "express";
import { db, scansTable, patientsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { AnalyzeScanBody, UpdateScanBody } from "@workspace/api-zod";
import { buildAnalysisResult } from "../lib/ai-simulation.js";
import { analyzeRetinalImage } from "../lib/image-analysis.js";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const patientIdParam = req.query["patientId"];
    const patientId = patientIdParam ? parseInt(String(patientIdParam), 10) : null;

    let scansRaw;
    if (patientId) {
      scansRaw = await db.select().from(scansTable)
        .where(and(eq(scansTable.patientId, patientId), eq(scansTable.isDeleted, false)))
        .orderBy(desc(scansTable.createdAt));
    } else {
      scansRaw = await db.select().from(scansTable)
        .where(eq(scansTable.isDeleted, false))
        .orderBy(desc(scansTable.createdAt));
    }

    const patientMap = new Map<number, string>();
    const patients = await db.select({ id: patientsTable.id, name: patientsTable.name }).from(patientsTable);
    for (const p of patients) {
      patientMap.set(p.id, p.name);
    }

    const scans = scansRaw.map((s) => ({
      ...s,
      patientName: patientMap.get(s.patientId) ?? null,
    }));

    return res.json(scans);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch scans" });
  }
});

router.post("/analyze", async (req, res) => {
  const uploadedAt = new Date();
  try {
    const parsed = AnalyzeScanBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { patientId, imageData } = parsed.data;

    const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, patientId));
    if (!patient) {
      return res.status(400).json({ error: "Patient not found" });
    }

    // Run real pixel-level retinal image analysis when an image is provided
    const imageAnalysis = imageData ? await analyzeRetinalImage(imageData) : null;
    const analysis = buildAnalysisResult(imageAnalysis);

    const [scan] = await db.insert(scansTable).values({
      patientId,
      imageData,
      drStage: analysis.drStage,
      createdAt: uploadedAt, // Save exact upload UTC boundary
      confidenceScore: analysis.confidenceScore,
      riskLevel: analysis.riskLevel,
      blindnessRiskScore: analysis.blindnessRiskScore,
      heatmapData: analysis.heatmapData,
      doctorConfirmed: false,
      recommendation: analysis.recommendation,
    }).returning();

    return res.status(201).json({ ...scan, patientName: patient.name });
  } catch (err) {
    return res.status(500).json({ error: "Failed to analyze scan" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] ?? "0", 10);
    const [scan] = await db.select().from(scansTable).where(
      and(eq(scansTable.id, id), eq(scansTable.isDeleted, false))
    );
    if (!scan) return res.status(404).json({ error: "Scan not found" });

    const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, scan.patientId));
    return res.json({ ...scan, patientName: patient?.name ?? null });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch scan" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] ?? "0", 10);
    const parsed = UpdateScanBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const [existingScan] = await db.select().from(scansTable).where(
      and(eq(scansTable.id, id), eq(scansTable.isDeleted, false))
    );
    if (!existingScan) return res.status(404).json({ error: "Scan not found" });

    const updateData: Record<string, unknown> = {};
    if (parsed.data.doctorConfirmed !== undefined && parsed.data.doctorConfirmed !== null) {
      updateData["doctorConfirmed"] = parsed.data.doctorConfirmed;
    }
    if (parsed.data.doctorNotes !== undefined) {
      updateData["doctorNotes"] = parsed.data.doctorNotes;
    }
    if (parsed.data.doctorId !== undefined) {
      updateData["doctorId"] = parsed.data.doctorId;
    }

    const [updatedScan] = await db.update(scansTable)
      .set(updateData)
      .where(eq(scansTable.id, id))
      .returning();

    const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, updatedScan!.patientId));
    return res.json({ ...updatedScan, patientName: patient?.name ?? null });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update scan" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] ?? "0", 10);
    const [scan] = await db.update(scansTable)
      .set({ isDeleted: true })
      .where(eq(scansTable.id, id))
      .returning();

    if (!scan) return res.status(404).json({ error: "Scan not found" });
    
    return res.json({ success: true, message: "Scan deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete scan" });
  }
});

export default router;
