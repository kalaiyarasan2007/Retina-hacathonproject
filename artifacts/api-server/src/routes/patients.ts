import { Router, type IRouter } from "express";
import { db, patientsTable, scansTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { CreatePatientBody } from "@workspace/api-zod";

const router: IRouter = Router();

// Helper to strictly enforce dynamic, sequential IDs without gaps
async function reassignPatientIds() {
  // Purge any legacy soft-deleted patients physically to prevent them from breaking the count
  await db.delete(patientsTable).where(eq(patientsTable.isDeleted, true));

  // Fetch all existing active patients and sort by creation order
  const allPatients = await db.select().from(patientsTable).orderBy(patientsTable.createdAt);
  
  if (allPatients.length === 0) return;

  // Pass 1: Shift all IDs to a safe negative space to completely avoid Postgres Unique Key collisions during reassignment
  for (let i = 0; i < allPatients.length; i++) {
    const currentId = allPatients[i].id;
    const tempId = -(currentId + 1000000); // Massive negative shift to guarantee no collisions
    await db.update(patientsTable).set({ id: tempId }).where(eq(patientsTable.id, currentId));
    await db.update(scansTable).set({ patientId: tempId }).where(eq(scansTable.patientId, currentId));
    allPatients[i].id = tempId; // Track shifted ID
  }
  
  // Pass 2: Reassign sequentially starting exactly from 1
  for (let i = 0; i < allPatients.length; i++) {
    const tempId = allPatients[i].id;
    const newId = i + 1;
    await db.update(patientsTable).set({ id: newId }).where(eq(patientsTable.id, tempId));
    await db.update(scansTable).set({ patientId: newId }).where(eq(scansTable.patientId, tempId));
  }
}

router.get("/", async (_req, res) => {
  try {
    const patients = await db.select().from(patientsTable).where(eq(patientsTable.isDeleted, false)).orderBy(patientsTable.createdAt);
    return res.json(patients);
  } catch (err) {
    console.error("Fetch patients error:", err);
    return res.status(500).json({ error: "Failed to fetch patients" });
  }
});

router.post("/", async (req, res) => {
  const createdAt = new Date();
  try {
    const parsed = CreatePatientBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { name, age, gender, diabetesType, contactInfo } = parsed.data;

    // Purge any legacy soft-deleted ghosts that could break the count
    await db.delete(patientsTable).where(eq(patientsTable.isDeleted, true));

    // 1. Pack existing data gap-free according to creation order first
    await reassignPatientIds();

    // 2. Fetch all existing patients from the database
    const patients = await db.select().from(patientsTable);
    
    // 3. Count them and dynamically calculate the exact sequential integer ID
    const nextId = patients.length + 1;

    // Generate patient ID string requested via formatting logic (useful for exact response mapping)
    const patientId = "PT-" + String(nextId).padStart(4, "0");

    // 4. Force explicitly inject dynamic ID bypassing underlying serial counters
    const [patient] = await db.insert(patientsTable).values({
      id: nextId,
      name,
      age,
      gender,
      diabetesType: diabetesType ?? null,
      contactInfo: contactInfo ?? null,
      createdAt,
    }).returning();

    // 5. Update Postgres sequence pointer to avoid background DB anomalies
    try {
      await db.execute(sql`SELECT setval(pg_get_serial_sequence('patients', 'id'), ${nextId}, true)`);
    } catch {}

    // Attach patientId as explicit payload key for frontend matching (Constraint met)
    return res.status(201).json({ ...patient, patientId });
  } catch (err) {
    console.error("Create patient error:", err);
    return res.status(500).json({ error: "Failed to create patient" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] ?? "0", 10);
    const [patient] = await db.select().from(patientsTable).where(
      and(eq(patientsTable.id, id), eq(patientsTable.isDeleted, false))
    );
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    return res.json(patient);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch patient" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] ?? "0", 10);
    
    // HARD delete the selected patient
    const [patient] = await db.delete(patientsTable)
      .where(eq(patientsTable.id, id))
      .returning();
      
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    
    // Consistent cleanup of associated scans
    await db.delete(scansTable).where(eq(scansTable.patientId, id));

    // After deleting, automatically re-compress array indices to close gaps
    await reassignPatientIds();

    // Restore sequence pointer bounds based on new compacted metrics
    try {
       const existingPatients = await db.select().from(patientsTable);
       const maxId = Math.max(existingPatients.length, 1);
       await db.execute(sql`SELECT setval(pg_get_serial_sequence('patients', 'id'), ${maxId}, true)`);
    } catch {}

    return res.json({ success: true, message: "Patient and records deleted permanently" });
  } catch (err) {
    console.error("Delete patient error:", err);
    return res.status(500).json({ error: "Failed to delete patient" });
  }
});

export default router;

