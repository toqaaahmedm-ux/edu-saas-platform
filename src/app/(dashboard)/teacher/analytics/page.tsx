"use client";

import { BarChart3, Users, TrendingUp, ArrowUpRight, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

function useTeacherStats() {
  return useQuery({
    queryKey: ["teacher-stats"],
    queryFn: async () => {
      const res = await apiClient.get("/courses/teacher/stats");
      return res.data?.data ?? res.data;
    },
  });
}

function useTeacherAnalytics() {
  return useQuery({
    queryKey: ["teacher-analytics"],
    queryFn: async () => {
      const res = await apiClient.get("/courses/teacher/analytics");
      return res.data?.data ?? res.data;
    },
  });
}

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useTeacherStats();
  const { data: analytics, isLoading: analyticsLoading } = useTeacherAnalytics();
  const loading = statsLoading || analyticsLoading;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  const statCards = [
    { label: "Active Students", value: stats?.totalStudents ?? 0, icon: <Users className="text-blue-600" /> },
    { label: "Published Courses", value: stats?.publishedCourses ?? 0, icon: <BarChart3 className="text-purple-600" /> },
    { label: "Active Quizzes", value: stats?.activeQuizzes ?? 0, icon: <TrendingUp className="text-emerald-600" /> },
  ];

  const performanceTrend = analytics?.performanceTrend ?? [];
  const quizDistribution = analytics?.quizDistribution ?? [];
  const maxScore = Math.max(...performanceTrend.map((p: any) => p.score), 1);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 text-left">
      <div>
        <h2 className="text-3xl font-black text-slate-800">Performance Analytics</h2>
        <p className="text-slate-500 font-medium italic">Real data from your courses and students.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl">{stat.icon}</div>
              <span className="flex items-center gap-1 text-sm font-black text-emerald-500"><ArrowUpRight size={16} />Live</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h4 className="font-black text-slate-800 text-xl mb-8">Quiz Score Trend</h4>
          {performanceTrend.length === 0 || performanceTrend[0]?.month === 'No data' ? (
            <div className="flex items-center justify-center h-48 text-slate-400 font-medium">No quiz attempts yet</div>
          ) : (
            <div className="flex items-end justify-between h-48 gap-3 px-4">
              {performanceTrend.map((bar: any, i: number) => {
                const heightPct = Math.round((bar.score / maxScore) * 100);
                return (
                  <div key={i} className="flex-1 group relative flex flex-col items-center">
                    <div className="w-full bg-blue-100 group-hover:bg-blue-600 rounded-t-xl transition-all duration-700 cursor-pointer" style={{ height: `${heightPct}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold whitespace-nowrap">{bar.score}%</div>
                    </div>
                    <span className="mt-2 text-[10px] font-black text-slate-400">{bar.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
          <h4 className="font-black text-xl mb-8 relative z-10">Quiz Score Distribution</h4>
          <div className="space-y-6 relative z-10">
            {quizDistribution.map((item: any, index: number) => {
              const colors = ["bg-emerald-500", "bg-blue-500", "bg-red-400"];
              const total = quizDistribution.reduce((s: number, i: any) => s + i.value, 0);
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-200">{item.name}</span>
                    <span className="text-slate-400">{item.value} students ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className={`${colors[index]} h-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {quizDistribution.every((i: any) => i.value === 0) && <p className="text-slate-400 text-center py-4">No quiz attempts yet</p>}
          </div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}