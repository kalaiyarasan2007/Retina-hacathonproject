import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetAnalyticsSummary, useGetScans, useDeleteScan } from "@workspace/api-client-react";
import { formatMedicalDate } from "@/lib/utils";
import { Activity, AlertTriangle, CheckCircle, FileImage, ArrowRight, UploadCloud } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useGetAnalyticsSummary();
  const { data: recentScans, isLoading: scansLoading, refetch: refetchScans } = useGetScans();
  const deleteScanMutation = useDeleteScan();

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "text-destructive bg-destructive/10 border-destructive/20";
      case "high": return "text-orange-600 bg-orange-500/10 border-orange-500/20";
      case "medium": return "text-yellow-600 bg-yellow-500/10 border-yellow-500/20";
      case "low": return "text-green-600 bg-green-500/10 border-green-500/20";
      default: return "text-muted-foreground bg-muted border-border";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Clinic Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time diabetic retinopathy screening metrics.</p>
        </div>
        <Link href="/upload" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all w-max">
          <UploadCloud className="w-5 h-5" />
          New Scan
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Patients" 
          value={analytics?.totalPatients || 0} 
          icon={Activity} 
          loading={analyticsLoading} 
          trend="+12% this month"
        />
        <StatCard 
          title="Scans Analyzed" 
          value={analytics?.totalScans || 0} 
          icon={FileImage} 
          loading={analyticsLoading} 
          trend="+5% this week"
        />
        <StatCard 
          title="Critical Cases" 
          value={analytics?.criticalCases || 0} 
          icon={AlertTriangle} 
          loading={analyticsLoading}
          alert
        />
        <StatCard 
          title="Avg. Confidence" 
          value={analytics ? `${(analytics.averageConfidence * 100).toFixed(1)}%` : "0%"} 
          icon={CheckCircle} 
          loading={analyticsLoading} 
        />
      </div>

      {/* Recent Scans Table */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
          <h2 className="text-xl font-bold font-display">Recent Screenings</h2>
          <Link href="/patients" className="text-primary font-medium hover:underline flex items-center gap-1 text-sm">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Patient</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">DR Stage</th>
                <th className="p-4 font-medium">Risk Level</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {scansLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading recent scans...</td></tr>
              ) : recentScans && recentScans.length > 0 ? (
                recentScans.slice(0, 5).map(scan => (
                  <tr key={scan.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-semibold text-foreground">{scan.patientName || `Patient #${scan.patientId}`}</td>
                    <td className="p-4 text-muted-foreground text-sm">{formatMedicalDate(scan.createdAt)}</td>
                    <td className="p-4">
                      <span className="font-bold text-foreground">Stage {scan.drStage}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wider ${getRiskColor(scan.riskLevel)}`}>
                        {scan.riskLevel}
                      </span>
                    </td>
                    <td className="p-4">
                      {scan.doctorConfirmed ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" /> Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-orange-500 text-sm font-medium">
                          <AlertTriangle className="w-4 h-4" /> Pending Review
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/scans/${scan.id}`} className="text-primary font-semibold hover:text-teal-400 transition-colors text-sm">
                          View Result
                        </Link>
                        <DeleteButton 
                          onDelete={async () => {
                            await deleteScanMutation.mutateAsync({ id: scan.id });
                            refetchScans();
                            refetchAnalytics();
                          }}
                          title="Delete Scan?"
                          description="This will permanently delete this scan and its analysis. This action cannot be undone."
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No recent scans found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, loading, trend, alert }: any) {
  return (
    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border relative overflow-hidden group hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          ) : (
            <h3 className={`text-3xl font-display font-bold ${alert ? 'text-destructive' : 'text-foreground'}`}>
              {value}
            </h3>
          )}
        </div>
        <div className={`p-3 rounded-xl ${alert ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 text-xs font-medium text-muted-foreground flex items-center gap-1">
          <span className="text-green-600">{trend}</span>
        </div>
      )}
    </div>
  );
}
