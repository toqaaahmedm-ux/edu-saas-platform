"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { DollarSign, TrendingUp, Users, Percent, Loader2 } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#a855f7", "#8b5cf6", "#6366f1", "#3b82f6", "#0ea5e9"];

export default function SuperAdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/admin/analytics');
        setData(res.data?.data ?? res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  if (!data) {
    return <div className="text-slate-400">Failed to load analytics.</div>;
  }

  const statCards = [
    { label: "MRR", value: `${data.mrr.toLocaleString()} EGP`, icon: <DollarSign size={20} />, color: "bg-emerald-600" },
    { label: "ARR", value: `${data.arr.toLocaleString()} EGP`, icon: <TrendingUp size={20} />, color: "bg-purple-600" },
    { label: "Trial Conversion", value: `${data.trialConversionRate}%`, icon: <Percent size={20} />, color: "bg-blue-600" },
    { label: "Ever Trialed", value: data.everTrialed, icon: <Users size={20} />, color: "bg-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Platform Analytics</h2>
        <p className="text-slate-400 text-sm">Revenue and growth overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
            <div className={`w-9 h-9 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant growth */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h3 className="font-black text-white mb-4">Tenant Growth (Last 6 Months)</h3>
          {data.tenantGrowth?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.tenantGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 12 }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={3} dot={{ fill: "#a855f7" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm py-10 text-center">No growth data yet.</p>
          )}
        </div>

        {/* Revenue by plan */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h3 className="font-black text-white mb-4">Revenue (MRR) by Plan</h3>
          {data.revenueByPlan?.length > 0 ? (
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={260}>
                <PieChart>
                  <Pie
                    data={data.revenueByPlan}
                    dataKey="mrr"
                    nameKey="planName"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                  >
                    {data.revenueByPlan.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
              <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 12 }}
                    formatter={(value: any) => `${Number(value).toFixed(0)} EGP`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {data.revenueByPlan.map((p: any, i: number) => (
                  <div key={p.planName} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-300 font-bold">{p.planName}</span>
                    <span className="text-slate-500 text-xs ml-auto">{p.tenantCount} tenants</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm py-10 text-center">No revenue data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}