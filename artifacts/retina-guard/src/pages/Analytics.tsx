import React from "react";
import { motion } from "framer-motion";
import { useGetAnalyticsSummary } from "@workspace/api-client-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

const COLORS = ['#10b981', '#eab308', '#f97316', '#ef4444', '#7f1d1d'];

export default function Analytics() {
  const { data, isLoading } = useGetAnalyticsSummary();

  if (isLoading) return <div className="p-8 animate-pulse text-muted-foreground">Loading Analytics...</div>;
  if (!data) return <div className="p-8 text-destructive">Failed to load analytics</div>;

  const barData = data.drStageDistribution.map(d => ({ name: `Stage ${d.stage}`, count: d.count }));
  const pieData = data.riskBreakdown.map(d => ({ name: d.level, value: d.percentage }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-display font-bold text-foreground">Population Analytics</h1>
        <p className="text-muted-foreground mt-1">Macro-level insights on screened demographics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="font-bold text-lg mb-6 text-foreground">DR Stage Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#008080" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="font-bold text-lg mb-6 text-foreground">Risk Level Breakdown</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
