import React, { useEffect, useState, useRef } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { useGetScan, useUpdateScan, useDeleteScan } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { formatMedicalDate, cn } from "@/lib/utils";
import {
  AlertTriangle, CheckCircle, Volume2, VolumeX, Printer, ChevronLeft,
  Stethoscope, Activity, FileText, Languages, Trash2
} from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";

import { 
  type LangCode, LANGUAGES, DR_STAGE_LABELS, RISK_LABELS, UI, RECOMMENDATIONS 
} from "@/lib/i18n-data";
// ─── Narration builder ────────────────────────────────────────────────────────

function buildNarration(lang: LangCode, drStage: number, riskLevel: string, confidence: string, recommendation: string): string {
  const stage = DR_STAGE_LABELS[lang][drStage] ?? DR_STAGE_LABELS[lang][0];
  const risk  = RISK_LABELS[lang][riskLevel] ?? riskLevel;

  if (lang === "ta-IN") return [
    `உங்கள் கண் ரெட்டினா படம் ஆய்வு செய்யப்பட்டது.`,
    `கண்டறியப்பட்ட நிலை: ${stage}.`,
    `அபாய நிலை ${risk} ஆக உள்ளது.`,
    `ஏஐ முடிவின் நம்பிக்கை அளவு ${confidence} சதவீதம்.`,
    `மருத்துவ பரிந்துரை: ${recommendation}`,
  ].join("  ");

  if (lang === "hi-IN") return [
    `मरीज़ की स्कैन जांच पूरी हुई।`,
    `पता चला: ${stage}।`,
    `जोखिम स्तर ${risk} है।`,
    `विश्वास स्कोर ${confidence} प्रतिशत है।`,
    `सिफारिश: ${recommendation}`,
  ].join("  ");

  if (lang === "te-IN") return [
    `రోగి స్కాన్ విశ్లేషణ పూర్తయింది.`,
    `కనుగొనబడింది: ${stage}.`,
    `ప్రమాద స్థాయి ${risk}.`,
    `నమ్మకం స్కోర్ ${confidence} శాతం.`,
    `సిఫారసు: ${recommendation}`,
  ].join("  ");

  if (lang === "ml-IN") return [
    `രോഗിയുടെ സ്‌കാൻ വിശകലനം പൂർത്തിയായി.`,
    `കണ്ടെത്തൽ: ${stage}.`,
    `അപകട നില ${risk}.`,
    `ആത്മവിശ്വാസ സ്‌കോർ ${confidence} ശതമാനം.`,
    `ശുപാർശ: ${recommendation}`,
  ].join("  ");

  return [
    `Patient scan analysis complete.`,
    `Detected: ${stage}.`,
    `Risk level is ${risk}.`,
    `Confidence score is ${confidence} percent.`,
    `Recommendation: ${recommendation}`,
  ].join("  ");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScanResult() {
  const [, params] = useRoute("/scans/:id");
  const scanId = parseInt(params?.id || "0", 10);
  const { data: scan, isLoading, refetch } = useGetScan(scanId);
  const updateMutation = useUpdateScan();
  const deleteMutation = useDeleteScan();
  const { user } = useAuth();

  const [doctorNotes, setDoctorNotes] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LangCode>("en-US");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (scan?.doctorNotes) setDoctorNotes(scan.doctorNotes);
  }, [scan]);

  // Stop speaking instantly on language change
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [selectedLanguage]);

  // Cleanup on unmount
  useEffect(() => () => { window.speechSynthesis.cancel(); }, []);

  const t = UI[selectedLanguage];

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">{UI["en-US"].loading}</div>;
  if (!scan) return <div className="p-8 text-center text-destructive font-bold">{UI["en-US"].notFound}</div>;

  // Derived translated values
  const drStageLabel    = DR_STAGE_LABELS[selectedLanguage][scan.drStage] ?? DR_STAGE_LABELS["en-US"][scan.drStage]!;
  const riskLabel       = RISK_LABELS[selectedLanguage][scan.riskLevel] ?? scan.riskLevel;
  const recommendation  = RECOMMENDATIONS[selectedLanguage][scan.drStage] ?? RECOMMENDATIONS["en-US"][scan.drStage]!;
  const confidence      = (scan.confidenceScore * 100).toFixed(1);
  const isCritical      = scan.drStage >= 3;

  // Heatmap
  let heatmapPoints: { x: number; y: number; intensity: number; radius: number }[] = [];
  try { if (scan.heatmapData) heatmapPoints = JSON.parse(scan.heatmapData); } catch (_) {}
  if (heatmapPoints.length === 0 && scan.drStage > 0) {
    heatmapPoints = [
      { x: 30, y: 40, intensity: 0.8, radius: 15 },
      { x: 60, y: 35, intensity: 0.9, radius: 20 },
      { x: 45, y: 70, intensity: 0.6, radius: 10 },
    ];
  }

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    let text = buildNarration(selectedLanguage, scan.drStage, scan.riskLevel, confidence, recommendation);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang   = selectedLanguage;
    
    // Default config for all languages
    utterance.rate   = 0.75;
    utterance.pitch  = 1;
    utterance.volume = 1;

    // ── Tamil (ta-IN) specific TTS High-Quality Tuning ──
    if (selectedLanguage === "ta-IN") {
      // 1. Slow down the speech slightly for better Tamil clarity (0.80 matches user's request)
      utterance.rate = 0.80; 
      utterance.pitch = 1.0;
      
      // 2. Select the best available Tamil Neural voice, prioritizing MALE ValluvarNeural
      const voices = window.speechSynthesis.getVoices();
      const tamilVoices = voices.filter(v => v.lang.replace("_", "-").startsWith("ta"));
      
      const bestTamilVoice = tamilVoices.find(v => v.name.includes("ValluvarNeural")) || 
                             tamilVoices.find(v => v.name.includes("Male")) ||
                             tamilVoices.find(v => v.name.includes("Neural")) ||
                             tamilVoices.find(v => v.name.includes("ta-IN"));
      
      if (bestTamilVoice) {
        utterance.voice = bestTamilVoice;
      }
      
      // 3. Improve phrasing: Tamil synthesis engines often run words together. 
      // Padding punctuation with spaces dramatically helps the engine parse it smoothly.
      text = text.replace(/\./g, ". ").replace(/,/g, ", ");
      utterance.text = text;
    }

    utterance.onend   = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    utteranceRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleConfirm = async () => {
    await updateMutation.mutateAsync({ id: scan.id, data: { doctorConfirmed: true, doctorNotes, doctorId: user?.username } });
    refetch();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-card rounded-full shadow-sm hover:bg-muted transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              {t.scanResults}
              {scan.doctorConfirmed && <CheckCircle className="w-6 h-6 text-green-500" />}
            </h1>
            <p className="text-muted-foreground mt-1">Scan ID: {scan.id} • {formatMedicalDate(scan.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Language + Listen cluster */}
          <div className="flex items-center bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2 border-r border-border text-muted-foreground">
              <Languages className="w-4 h-4 shrink-0" />
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value as LangCode)}
                className="bg-transparent text-sm font-medium text-foreground focus:outline-none cursor-pointer"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.native} ({l.label})</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSpeak}
              className={cn(
                "flex items-center gap-2 px-3 py-2 transition-colors font-semibold text-sm",
                isSpeaking ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              )}
              title={isSpeaking ? t.stopBtn : t.listenBtn}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isSpeaking ? t.stopBtn : t.listenBtn}
            </button>
          </div>

          <Link
            href={`/reports/${scan.id}?lang=${selectedLanguage}`}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl shadow-sm hover:bg-muted transition-colors font-semibold text-sm h-[38px]"
          >
            <Printer className="w-4 h-4" />
            {t.printReport}
          </Link>
          
          <DeleteButton 
            onDelete={async () => {
              await deleteMutation.mutateAsync({ id: scan.id });
              window.location.href = `/patients/${scan.patientId}`;
            }}
            title="Delete Scan?"
            description="Permanently delete this scan. This action cannot be undone."
            buttonVariant="outline"
            buttonSize="default"
            iconOnly={false}
          />
        </div>
      </div>

      {/* ── Critical alert ── */}
      {isCritical && (
        <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-r-xl flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="text-destructive font-bold text-lg">{t.criticalHeading}</h3>
            <p className="text-destructive/80 text-sm font-medium">{t.criticalBody}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Image & Heatmap ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{t.retinalAnalysis}</h3>
              <div className="flex items-center gap-3 text-sm font-medium">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> {t.highLegend}</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> {t.medLegend}</span>
              </div>
            </div>

            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border-2 border-border flex items-center justify-center">
              {scan.imageData ? (
                <>
                  <img src={scan.imageData} alt="Scan" className="w-full h-full object-contain" />
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none mix-blend-hard-light opacity-80">
                    <defs>
                      <radialGradient id="grad-red">
                        <stop offset="0%" stopColor="red" stopOpacity="1" />
                        <stop offset="100%" stopColor="red" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient id="grad-yellow">
                        <stop offset="0%" stopColor="yellow" stopOpacity="1" />
                        <stop offset="100%" stopColor="yellow" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    {heatmapPoints.map((pt, i) => (
                      <circle key={i} cx={`${pt.x}%`} cy={`${pt.y}%`} r={`${pt.radius}%`}
                        fill={pt.intensity > 0.7 ? "url(#grad-red)" : "url(#grad-yellow)"}
                        opacity={pt.intensity} />
                    ))}
                  </svg>
                </>
              ) : (
                <div className="text-white/50 flex flex-col items-center gap-2">
                  <FileText className="w-12 h-12" />
                  <p>{t.noImage}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">{t.heatmapNote}</p>
          </div>
        </div>

        {/* ── Right: Diagnostics ── */}
        <div className="space-y-6">

          {/* DR Stage card */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 text-center">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">{t.drStage}</p>
            <h2 className="text-6xl font-display font-black text-primary mb-2">{scan.drStage}</h2>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6">
              {drStageLabel}
            </div>
            <div className="grid grid-cols-2 gap-4 text-left border-t border-border pt-6">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">{t.aiConfidence}</p>
                <p className="text-xl font-bold">{confidence}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">{t.blindnessRisk}</p>
                <p className="text-xl font-bold">{scan.blindnessRiskScore}/100</p>
              </div>
            </div>
          </div>

          {/* AI Recommendation — translated */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-bold flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-teal-500" /> {t.aiRecommendation}
            </h3>
            <p className="text-foreground text-sm leading-relaxed bg-muted/50 p-4 rounded-xl border border-border">
              {recommendation}
            </p>
          </div>

          {/* Doctor review */}
          {user?.role === "doctor" && !scan.doctorConfirmed && (
            <div className="bg-primary/5 rounded-2xl border-2 border-primary/20 p-6">
              <h3 className="font-bold text-primary flex items-center gap-2 mb-4">
                <Stethoscope className="w-5 h-5" /> {t.doctorReviewHeading}
              </h3>
              <textarea
                value={doctorNotes}
                onChange={e => setDoctorNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none mb-4 resize-none h-24"
                placeholder={t.notesPlaceholder}
              />
              <button
                onClick={handleConfirm}
                disabled={updateMutation.isPending}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updateMutation.isPending ? t.saving : t.confirmDiagnosis}
              </button>
            </div>
          )}

          {scan.doctorConfirmed && (
            <div className="bg-green-500/10 rounded-2xl border border-green-500/20 p-6">
              <h3 className="font-bold text-green-700 flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5" /> {t.confirmedBy} {scan.doctorId}
              </h3>
              {scan.doctorNotes && (
                <div className="mt-4 pt-4 border-t border-green-500/20">
                  <p className="text-xs text-green-800 font-semibold mb-1">{t.clinicalNotes}</p>
                  <p className="text-sm text-green-900">{scan.doctorNotes}</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );
}
