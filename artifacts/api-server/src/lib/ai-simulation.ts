import type { ImageAnalysisResult, HeatmapPoint } from "./image-analysis.js";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface AnalysisResult {
  drStage: number;
  confidenceScore: number;
  riskLevel: RiskLevel;
  blindnessRiskScore: number;
  heatmapData: string;
  recommendation: string;
}

const DR_STAGE_NAMES = [
  "No Diabetic Retinopathy",
  "Mild Diabetic Retinopathy",
  "Moderate Diabetic Retinopathy",
  "Severe Diabetic Retinopathy",
  "Proliferative Diabetic Retinopathy",
];

const RECOMMENDATIONS = [
  "Your retinal scan looks healthy. No signs of diabetic eye disease were found. Keep having your eyes checked once a year, and keep your blood sugar under control.",
  "Small changes were found in your retina. No treatment is needed right now. Visit your eye doctor every 6 months, eat healthy, and manage your blood sugar carefully.",
  "Noticeable changes were found in your retina. Please see an eye specialist within 3 to 6 months. Keep blood sugar tightly controlled. Laser treatment may be needed.",
  "URGENT: Serious damage found in your retina. See an eye specialist within 1 month. Do not delay — vision loss is possible if untreated. Treatment such as laser or injections may be required.",
  "EMERGENCY: Very severe damage found. Go to the hospital immediately. Surgery may be needed. Delay can cause permanent blindness.",
];

function getRiskLevel(drStage: number): RiskLevel {
  if (drStage === 0) return "low";
  if (drStage === 1) return "medium";
  if (drStage === 2) return "high";
  return "critical";
}

function getBlindnessRiskScore(drStage: number): number {
  const baseScores = [5, 20, 40, 65, 90];
  const base = baseScores[drStage] ?? 5;
  const variance = Math.floor((Math.random() - 0.5) * 8);
  return Math.min(100, Math.max(0, base + variance));
}

/**
 * Build a final AnalysisResult from a real image analysis.
 * When imageAnalysis is provided the DR stage, confidence score and heatmap
 * all come from actual pixel measurements of the retinal image.
 * If imageAnalysis is null (no image provided) a pure simulation is used.
 */
export function buildAnalysisResult(
  imageAnalysis: ImageAnalysisResult | null
): AnalysisResult {
  let drStage: number;
  let confidenceScore: number;
  let heatmapPoints: HeatmapPoint[];

  if (imageAnalysis) {
    // Use image-derived values
    drStage         = imageAnalysis.drStage;
    confidenceScore = imageAnalysis.confidenceScore;
    heatmapPoints   = imageAnalysis.heatmapPoints;
  } else {
    // Fallback: random simulation (no image provided)
    const rand = Math.random();
    if      (rand < 0.35) drStage = 0;
    else if (rand < 0.55) drStage = 1;
    else if (rand < 0.73) drStage = 2;
    else if (rand < 0.88) drStage = 3;
    else                  drStage = 4;

    confidenceScore = parseFloat((0.72 + Math.random() * 0.25).toFixed(3));
    heatmapPoints   = generateFallbackHeatmap(drStage);
  }

  return {
    drStage,
    confidenceScore,
    riskLevel:          getRiskLevel(drStage),
    blindnessRiskScore: getBlindnessRiskScore(drStage),
    heatmapData:        JSON.stringify(heatmapPoints),
    recommendation:     RECOMMENDATIONS[drStage] ?? RECOMMENDATIONS[0]!,
  };
}

/** Keep the old export name for any other callers. */
export function simulateAIAnalysis(): AnalysisResult {
  return buildAnalysisResult(null);
}

function generateFallbackHeatmap(drStage: number): HeatmapPoint[] {
  const numSpots = drStage === 0 ? 0 : 3 + drStage * 3;
  const spots: HeatmapPoint[] = [];
  for (let i = 0; i < numSpots; i++) {
    spots.push({
      x:         20 + Math.random() * 60,
      y:         20 + Math.random() * 60,
      intensity: 0.4 + (drStage / 4) * 0.6 + (Math.random() - 0.5) * 0.2,
      radius:    5 + Math.random() * (drStage * 3),
    });
  }
  if (drStage >= 3) {
    spots.push({ x: 50, y: 50, intensity: 0.9, radius: 8 + drStage * 2 });
  }
  return spots;
}

export { DR_STAGE_NAMES };
