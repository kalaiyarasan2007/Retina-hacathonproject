import { Router, type IRouter } from "express";
import { db, scansTable, patientsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { DR_STAGE_NAMES } from "../lib/ai-simulation.js";

const router: IRouter = Router();

const RISK_DESCRIPTIONS: Record<string, string> = {
  low: "Low risk of vision loss. Regular monitoring is sufficient.",
  medium: "Moderate risk. Enhanced monitoring and glycemic control are recommended.",
  high: "High risk of progression. Specialist referral is strongly advised.",
  critical: "Critical risk of severe vision loss or blindness. Immediate intervention required.",
};

const TREATMENT_PLANS: Record<number, string> = {
  0: "Annual dilated eye examination. Continue current diabetes management. Target HbA1c < 7%, blood pressure < 130/80 mmHg.",
  1: "Eye examination every 6-9 months. Intensify glycemic control. Evaluate blood pressure and lipid management. Patient education on DR risk factors.",
  2: "Referral to retinal specialist within 3-6 months. Consider focal laser photocoagulation. Optimize systemic risk factors. Follow up every 3-4 months.",
  3: "Urgent referral to retinal specialist within 1-4 weeks. Scatter laser photocoagulation (PRP) evaluation. Anti-VEGF therapy assessment. Intravitreal injection consideration.",
  4: "Emergency referral to vitreoretinal surgeon. Immediate pan-retinal photocoagulation or vitrectomy evaluation. Anti-VEGF injection protocol. Traction retinal detachment assessment.",
};

router.get("/:scanId", async (req, res) => {
  try {
    const scanId = parseInt(req.params["scanId"] ?? "0", 10);
    const [scan] = await db.select().from(scansTable).where(
      and(eq(scansTable.id, scanId), eq(scansTable.isDeleted, false))
    );
    if (!scan) return res.status(404).json({ error: "Scan not found" });

    const [patient] = await db.select().from(patientsTable).where(
      and(eq(patientsTable.id, scan.patientId), eq(patientsTable.isDeleted, false))
    );
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const drStageName = DR_STAGE_NAMES[scan.drStage] ?? "Unknown";
    const riskDescription = RISK_DESCRIPTIONS[scan.riskLevel] ?? "";
    const treatmentPlan = TREATMENT_PLANS[scan.drStage] ?? "";

    return res.json({
      scan: { ...scan, patientName: patient.name },
      patient,
      generatedAt: new Date().toISOString(),
      drStageName,
      riskDescription,
      treatmentPlan,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to generate report" });
  }
});

export default router;
