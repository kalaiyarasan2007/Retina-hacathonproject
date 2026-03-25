import React, { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useGetReport } from "@workspace/api-client-react";
import { formatMedicalDate } from "@/lib/utils";
import { 
  type LangCode, DR_STAGE_LABELS, RISK_LABELS, UI, RECOMMENDATIONS 
} from "@/lib/i18n-data";

export default function Report() {
  const [, params] = useRoute("/reports/:scanId");
  const scanId = parseInt(params?.scanId || "0", 10);
  const { data, isLoading } = useGetReport(scanId);
  
  // Get language from URL query param
  const [lang, setLang] = useState<LangCode>("en-US");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const langParam = searchParams.get("lang") as LangCode;
    if (langParam && ["en-US", "ta-IN", "hi-IN", "te-IN", "ml-IN"].includes(langParam)) {
      setLang(langParam);
    }
  }, []);

  useEffect(() => {
    // Optional: auto-trigger print once loaded
  }, [data]);

  if (isLoading) return <div className="p-8">Generating Report...</div>;
  if (!data) return <div className="p-8 text-red-600">Error loading report</div>;

  const t = UI[lang];
  const localizedStage = DR_STAGE_LABELS[lang][data.scan.drStage] || data.drStageName;
  const localizedRisk = RISK_LABELS[lang][data.scan.riskLevel] || data.scan.riskLevel;
  const localizedRecommendation = RECOMMENDATIONS[lang][data.scan.drStage] || data.treatmentPlan;

  return (
    <div className="min-h-screen bg-white text-black p-8 md:p-16 max-w-[1000px] mx-auto print:p-0 print:max-w-none">
      <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
        <div className="flex items-center gap-4">
          <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} className="w-12 h-12 grayscale" alt="Logo"/>
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">{t.clinicalReport}</h1>
            <p className="text-slate-600 font-sans mt-1">{t.automatedAssessment}</p>
          </div>
        </div>
        <div className="text-right text-sm text-slate-500 font-mono">
          <p>Generated: {formatMedicalDate(data.generatedAt)}</p>
          <p>Scan ID: {data.scan.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="p-6 border border-slate-200 rounded-xl">
          <h2 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-4">{t.patientInfo}</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr><td className="py-1 text-slate-500">{t.name}</td><td className="py-1 font-bold">{data.patient.name}</td></tr>
              <tr><td className="py-1 text-slate-500">{t.ageGender}</td><td className="py-1 font-bold">{data.patient.age} / <span className="capitalize">{data.patient.gender}</span></td></tr>
              <tr><td className="py-1 text-slate-500">{t.diabetesType}</td><td className="py-1 font-bold uppercase">{data.patient.diabetesType || "Unknown"}</td></tr>
              <tr><td className="py-1 text-slate-500">ID</td><td className="py-1 font-mono">PT-{data.patient.id.toString().padStart(4, '0')}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="p-6 border border-slate-200 rounded-xl bg-slate-50">
          <h2 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-4">{t.summary}</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr><td className="py-1 text-slate-500">{t.drStage}</td><td className="py-1 font-bold text-lg">{data.scan.drStage} - {localizedStage}</td></tr>
              <tr><td className="py-1 text-slate-500">{t.aiConfidence}</td><td className="py-1 font-bold">{(data.scan.confidenceScore * 100).toFixed(1)}%</td></tr>
              <tr><td className="py-1 text-slate-500">{t.blindnessRisk}</td><td className="py-1 font-bold uppercase text-red-600">{localizedRisk}</td></tr>
              <tr><td className="py-1 text-slate-500">{t.clinicalStatus}</td><td className="py-1 font-bold">{data.scan.doctorConfirmed ? `${t.confirmed} (Dr. ${data.scan.doctorId})` : t.pending}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-4 border-b border-slate-200 pb-2">{t.analysisImage}</h2>
        <div className="w-full max-w-2xl mx-auto border border-slate-200 rounded-xl p-2 bg-slate-100">
           {data.scan.imageData ? (
             <img src={data.scan.imageData} alt="Fundus Scan" className="w-full h-auto rounded-lg object-contain" />
           ) : (
             <div className="w-full aspect-video flex items-center justify-center text-slate-400">{t.noImage}</div>
           )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-2">{t.aiRecommendation}</h2>
          <p className="text-slate-800 leading-relaxed bg-slate-50 p-4 border border-slate-200 rounded-lg">{localizedRecommendation}</p>
        </div>
        <div>
          <h2 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-2">{t.treatmentPlan}</h2>
          <p className="text-slate-800 leading-relaxed bg-slate-50 p-4 border border-slate-200 rounded-lg">{localizedRecommendation}</p>
        </div>
        {data.scan.doctorNotes && (
          <div>
            <h2 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-2">{t.physicianNotes}</h2>
            <p className="text-slate-800 leading-relaxed font-serif italic border-l-4 border-slate-400 pl-4">{data.scan.doctorNotes}</p>
          </div>
        )}
      </div>

      <div className="mt-16 pt-8 border-t border-slate-300 text-center text-xs text-slate-400">
        <p>{t.footerLine1}</p>
        <p className="mt-1">{t.footerLine2}</p>
      </div>
      
      {/* Utility print button for non-print view */}
      <div className="mt-8 text-center print:hidden">
        <button onClick={() => window.print()} className="px-6 py-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 font-bold">
          {t.printReport}
        </button>
      </div>
    </div>
  );
}

