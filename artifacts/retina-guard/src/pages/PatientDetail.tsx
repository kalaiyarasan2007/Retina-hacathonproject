import React from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { useGetPatient, useGetScans, useDeleteScan } from "@workspace/api-client-react";
import { formatMedicalDate } from "@/lib/utils";
import { ChevronLeft, FileImage, Activity, AlertTriangle } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";

export default function PatientDetail() {
  const [, params] = useRoute("/patients/:id");
  const patientId = parseInt(params?.id || "0", 10);
  
  const { data: patient, isLoading: pLoading } = useGetPatient(patientId);
  const { data: scans, isLoading: sLoading, refetch } = useGetScans({ patientId });
  const deleteScanMutation = useDeleteScan();

  if (pLoading) return <div className="p-8 animate-pulse text-muted-foreground">Loading patient record...</div>;
  if (!patient) return <div className="p-8 text-destructive">Patient not found</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/patients" className="p-2 bg-card rounded-full shadow-sm hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">{patient.name}</h1>
          <p className="text-muted-foreground">ID: #PT-{patient.id.toString().padStart(4, '0')} • Registered {formatMedicalDate(patient.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border h-max">
          <h3 className="font-bold text-lg border-b border-border pb-4 mb-4">Demographics</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Age</span><span className="font-bold">{patient.age}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Gender</span><span className="font-bold capitalize">{patient.gender}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Diabetes Type</span><span className="font-bold uppercase">{patient.diabetesType || "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Contact</span><span className="font-bold">{patient.contactInfo || "N/A"}</span></div>
          </div>
        </div>

        <div className="md:col-span-2 bg-card p-6 rounded-2xl shadow-sm border border-border">
           <h3 className="font-bold text-lg border-b border-border pb-4 mb-4 flex items-center justify-between">
             <span>Scan History</span>
             <span className="text-sm font-normal text-muted-foreground">{scans?.length || 0} Total Scans</span>
           </h3>
           
           <div className="space-y-4">
             {sLoading ? (
               <p className="text-muted-foreground">Loading scans...</p>
             ) : scans && scans.length > 0 ? (
               scans.map((scan) => (
                  <div key={scan.id} className="relative block">
                    <Link href={`/scans/${scan.id}`} className="block">
                      <div className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/30 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${scan.drStage >= 3 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                            <FileImage className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">DR Stage {scan.drStage}</h4>
                            <p className="text-xs text-muted-foreground">{formatMedicalDate(scan.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right pr-12">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-bold uppercase border ${scan.riskLevel === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-muted text-muted-foreground border-border'}`}>
                            {scan.riskLevel} Risk
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {scan.doctorConfirmed ? "Reviewed" : "Pending Review"}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                      <DeleteButton 
                        onDelete={async () => {
                          await deleteScanMutation.mutateAsync({ id: scan.id });
                          refetch();
                        }}
                        title="Delete Scan?"
                        description="This will permanently delete this scan and its analysis. This action cannot be undone."
                      />
                    </div>
                  </div>
             ))
             ) : (
               <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                 <Activity className="w-12 h-12 mb-3 opacity-20" />
                 <p>No scans recorded for this patient.</p>
                 <Link href="/upload" className="text-primary hover:underline mt-2 text-sm font-semibold">Upload New Scan</Link>
               </div>
             )}
           </div>
        </div>
      </div>
    </motion.div>
  );
}
