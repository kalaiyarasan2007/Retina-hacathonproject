import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetScans, useDeleteScan } from "@workspace/api-client-react";
import { formatMedicalDate } from "@/lib/utils";
import { ClipboardCheck, ArrowRight, AlertTriangle } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";

export default function DoctorReview() {
  const { data: scans, isLoading, refetch } = useGetScans();
  const deleteScanMutation = useDeleteScan();

  const unconfirmedScans = scans?.filter(s => !s.doctorConfirmed).sort((a, b) => b.drStage - a.drStage) || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-4xl font-display font-bold text-foreground">Doctor Review Inbox</h1>
        <p className="text-muted-foreground mt-1">Pending AI diagnoses requiring clinical confirmation.</p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground animate-pulse">Loading inbox...</div>
      ) : unconfirmedScans.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">All Caught Up!</h2>
          <p className="text-muted-foreground mt-2">No pending scans require your review at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unconfirmedScans.map(scan => (
            <Link key={scan.id} href={`/scans/${scan.id}`}>
              <div className="bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all rounded-2xl overflow-hidden group">
                <div className={`h-2 ${scan.drStage >= 3 ? 'bg-destructive' : 'bg-yellow-500'}`} />
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">Patient: {scan.patientName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatMedicalDate(scan.createdAt)}</p>
                    </div>
                    {scan.drStage >= 3 && <AlertTriangle className="w-5 h-5 text-destructive" />}
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-display font-black text-foreground group-hover:text-primary transition-colors">
                      Stage {scan.drStage}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground mt-1">AI Confidence: {(scan.confidenceScore*100).toFixed(1)}%</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border text-primary font-bold text-sm">
                    <span className="flex items-center">
                      Review Details
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform inline" />
                    </span>
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
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
}
