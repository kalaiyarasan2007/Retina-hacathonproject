import { db, patientsTable, scansTable } from "@workspace/db";

const patients = [
  { name: "Priya Sharma", age: 52, gender: "female", diabetesType: "type2", contactInfo: "+91 98765 43210" },
  { name: "Rajan Kumar", age: 65, gender: "male", diabetesType: "type2", contactInfo: "+91 87654 32109" },
  { name: "Meena Patel", age: 44, gender: "female", diabetesType: "type1", contactInfo: "+91 76543 21098" },
  { name: "Suresh Nair", age: 70, gender: "male", diabetesType: "type2", contactInfo: "+91 65432 10987" },
  { name: "Anita Rao", age: 38, gender: "female", diabetesType: "gestational", contactInfo: "+91 54321 09876" },
  { name: "Vikram Singh", age: 58, gender: "male", diabetesType: "type2", contactInfo: "+91 43210 98765" },
  { name: "Lakshmi Devi", age: 61, gender: "female", diabetesType: "type2", contactInfo: "+91 32109 87654" },
  { name: "Abdul Hassan", age: 49, gender: "male", diabetesType: "type1", contactInfo: "+91 21098 76543" },
];

const scanTemplates = [
  { drStage: 0, confidenceScore: 0.94, riskLevel: "low" as const, blindnessRiskScore: 5, doctorConfirmed: true },
  { drStage: 1, confidenceScore: 0.87, riskLevel: "medium" as const, blindnessRiskScore: 18, doctorConfirmed: true },
  { drStage: 2, confidenceScore: 0.91, riskLevel: "high" as const, blindnessRiskScore: 42, doctorConfirmed: false },
  { drStage: 3, confidenceScore: 0.88, riskLevel: "critical" as const, blindnessRiskScore: 67, doctorConfirmed: false },
  { drStage: 4, confidenceScore: 0.95, riskLevel: "critical" as const, blindnessRiskScore: 89, doctorConfirmed: false },
  { drStage: 0, confidenceScore: 0.92, riskLevel: "low" as const, blindnessRiskScore: 3, doctorConfirmed: true },
  { drStage: 1, confidenceScore: 0.83, riskLevel: "medium" as const, blindnessRiskScore: 22, doctorConfirmed: false },
  { drStage: 2, confidenceScore: 0.89, riskLevel: "high" as const, blindnessRiskScore: 38, doctorConfirmed: true },
];

const RECOMMENDATIONS = [
  "Continue routine annual eye exams. Maintain good blood sugar and blood pressure control.",
  "Follow up with ophthalmologist every 6-9 months. Focus on improving glycemic control.",
  "Refer to retinal specialist within 3-6 months. Consider laser photocoagulation evaluation.",
  "URGENT: Refer to retinal specialist within 1 month. High risk of vision loss.",
  "EMERGENCY: Immediate referral to vitreoretinal surgeon. Risk of blindness is very high.",
];

function generateHeatmap(drStage: number): string {
  const numSpots = drStage === 0 ? 0 : 3 + drStage * 3;
  const spots = [];
  for (let i = 0; i < numSpots; i++) {
    spots.push({
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      intensity: 0.4 + (drStage / 4) * 0.6,
      radius: 5 + Math.random() * (drStage * 3),
    });
  }
  return JSON.stringify(spots);
}

async function seed() {
  console.log("Seeding database...");

  const existingPatients = await db.select().from(patientsTable);
  if (existingPatients.length > 0) {
    console.log("Database already seeded. Skipping.");
    process.exit(0);
  }

  const insertedPatients = await db.insert(patientsTable).values(patients).returning();
  console.log(`Inserted ${insertedPatients.length} patients`);

  const scans = insertedPatients.map((p, i) => {
    const template = scanTemplates[i % scanTemplates.length]!;
    return {
      patientId: p.id,
      imageData: null,
      drStage: template.drStage,
      confidenceScore: template.confidenceScore,
      riskLevel: template.riskLevel,
      blindnessRiskScore: template.blindnessRiskScore,
      heatmapData: generateHeatmap(template.drStage),
      doctorConfirmed: template.doctorConfirmed,
      doctorNotes: template.doctorConfirmed ? "Reviewed and confirmed by Dr. Smith." : null,
      doctorId: template.doctorConfirmed ? "doctor" : null,
      recommendation: RECOMMENDATIONS[template.drStage] ?? RECOMMENDATIONS[0]!,
    };
  });

  const insertedScans = await db.insert(scansTable).values(scans).returning();
  console.log(`Inserted ${insertedScans.length} scans`);
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
