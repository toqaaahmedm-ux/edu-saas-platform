"use client";

import { BarChart3, Users, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { COURSES } from "@/data/courses.data";

export default function AnalyticsPage() {
  // إحصائيات الأداء - تم تحويل العملة لـ EGP لتناسب هوية المنصة (Architecture Fix)
  const stats = [
    { label: "Total Revenue", value: "EGP 42,500", trend: "+12.5%", isUp: true, icon: <DollarSign className="text-emerald-600" /> },
    { label: "Active Students", value: "1,284", trend: "+18.2%", isUp: true, icon: <Users className="text-blue-600" /> },
    { label: "Course Completions", value: "85%", trend: "-2.4%", isUp: false, icon: <BarChart3 className="text-purple-600" /> },
  ];

  // بيانات الرسم البياني - استخدام الـ Months لتوضيح النمو الزمني
  const chartData = [
    { label: "JAN", height: "h-[40%]" },
    { label: "FEB", height: "h-[70%]" },
    { label: "MAR", height: "h-[45%]" },
    { label: "APR", height: "h-[90%]" },
    { label: "MAY", height: "h-[65%]" },
    { label: "JUN", height: "h-[80%]" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 text-left">
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-black text-slate-800">Performance Analytics</h2>
        <p className="text-slate-500 font-medium italic">Monitor system growth and user engagement levels.</p>
      </div>

      {/* Stats Cards - Interactive Hover Effects Added */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-slate-100 transition-colors">{stat.icon}</div>
              <span className={`flex items-center gap-1 text-sm font-black ${stat.isUp ? "text-emerald-500" : "text-red-500"}`}>
                {stat.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Custom Enrollment Chart - Pure Tailwind Architecture */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-black text-slate-800 text-xl">Monthly Enrollment</h4>
            <select aria-label="Timeframe" className="bg-slate-50 border-none text-xs font-bold rounded-xl px-4 py-2 outline-none cursor-pointer">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          
          <div className="flex items-end justify-between h-48 gap-3 px-4">
            {chartData.map((bar, i) => (
              <div key={i} className="flex-1 group relative">
                <div className={`bg-blue-100 group-hover:bg-blue-600 rounded-t-xl transition-all duration-700 cursor-pointer ${bar.height}`}>
                  {/* Tooltip Fix: تم تعديل الـ Logic لقراءة النسبة بشكل صحيح */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    {bar.height.match(/\d+/)?.[0]}%
                  </div>
                </div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Courses Card - Dark Theme for Visual Balance */}
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
          <h4 className="font-black text-xl mb-8 relative z-10">Top Performing Courses</h4>
          <div className="space-y-7 relative z-10">
            {COURSES.slice(0, 3).map((course, index) => {
              const colors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500"];
              const widths = ["w-[90%]", "w-[75%]", "w-[60%]"];
              return (
                <div key={course.id} className="space-y-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-200">{course.title}</span>
                    <span className="text-slate-400 font-medium">Active Stats</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className={`${colors[index]} h-full ${widths[index]} transition-all duration-1000 ease-out`}></div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Decorative element for SaaS aesthetic */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
