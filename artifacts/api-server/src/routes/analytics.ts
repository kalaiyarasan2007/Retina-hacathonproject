import { Router, type IRouter } from "express";
import { db, scansTable, patientsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { DR_STAGE_NAMES } from "../lib/ai-simulation.js";

const router: IRouter = Router();

router.get("/summary", async (_req, res) => {
  try {
    const [patients, scans] = await Promise.all([
      db.select().from(patientsTable).where(eq(patientsTable.isDeleted, false)),
      db.select().from(scansTable).where(eq(scansTable.isDeleted, false)).orderBy(desc(scansTable.createdAt)),
    ]);

    const totalPatients = patients.length;
    const totalScans = scans.length;
    const confirmedScans = scans.filter((s) => s.doctorConfirmed).length;
    const criticalCases = scans.filter((s) => s.riskLevel === "critical").length;
    const averageConfidence = totalScans > 0
      ? parseFloat((scans.reduce((acc, s) => acc + s.confidenceScore, 0) / totalScans).toFixed(3))
      : 0;

    const stageCounts = new Map<number, number>();
    for (let i = 0; i <= 4; i++) stageCounts.set(i, 0);
    for (const scan of scans) {
      stageCounts.set(scan.drStage, (stageCounts.get(scan.drStage) ?? 0) + 1);
    }

    const drStageDistribution = Array.from(stageCounts.entries()).map(([stage, count]) => ({
      stage,
      stageName: DR_STAGE_NAMES[stage] ?? `Stage ${stage}`,
      count,
    }));

    const riskCounts = new Map<string, number>([
      ["low", 0], ["medium", 0], ["high", 0], ["critical", 0],
    ]);
    for (const scan of scans) {
      riskCounts.set(scan.riskLevel, (riskCounts.get(scan.riskLevel) ?? 0) + 1);
    }

    const riskBreakdown = Array.from(riskCounts.entries()).map(([level, count]) => ({
      level,
      count,
      percentage: totalScans > 0 ? parseFloat(((count / totalScans) * 100).toFixed(1)) : 0,
    }));

    const patientMap = new Map<number, string>();
    for (const p of patients) {
      patientMap.set(p.id, p.name);
    }

    const recentScans = scans.slice(0, 10).map((s) => ({
      ...s,
      patientName: patientMap.get(s.patientId) ?? null,
    }));

    res.json({
      totalPatients,
      totalScans,
      confirmedScans,
      criticalCases,
      averageConfidence,
      drStageDistribution,
      riskBreakdown,
      recentScans,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;
