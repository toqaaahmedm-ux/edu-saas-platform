"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Users, GraduationCap, BookOpen, TrendingUp, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useTranslations } from "next-intl";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626"];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("adminAnalytics");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/admin/tenant-analytics');
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
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!data) {
    return <div className="text-slate-400 font-bold">{t("loadFailed")}</div>;
  }

  const statCards = [
    { label: t("totalTeachers"), value: data.overview.totalTeachers, icon: <GraduationCap size={20} />, color: "bg-blue-600" },
    { label: t("totalStudents"), value: data.overview.totalStudents, icon: <Users size={20} />, color: "bg-emerald-600" },
    { label: t("totalCourses"), value: data.overview.totalCourses, icon: <BookOpen size={20} />, color: "bg-amber-500" },
    { label: t("completionRate"), value: `${data.overview.completionRate}%`, icon: <TrendingUp size={20} />, color: "bg-slate-700" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 text-left">
      <div>
        <h2 className="text-3xl font-black text-slate-800 mb-1">{t("title")}</h2>
        <p className="text-slate-400 font-medium">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-2xl text-white ${s.color} shadow-lg`}>
              {s.icon}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6">{t("enrollmentsLast6")}</h3>
          {data.enrollmentTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 }} />
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-center py-10 font-bold italic">{t("noEnrollmentData")}</p>
          )}
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6">{t("studentProgressDistribution")}</h3>
          {data.studentProgressDistribution?.some((d: any) => d.count > 0) ? (
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={260}>
                <PieChart>
                  <Pie data={data.studentProgressDistribution} dataKey="count" nameKey="range" cx="50%" cy="50%" innerRadius={60} outerRadius={90}>
                    {data.studentProgressDistribution.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {data.studentProgressDistribution.map((d: any, i: number) => (
                  <div key={d.range} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-600 font-bold">{d.range}%</span>
                    <span className="text-slate-400 text-xs ml-auto">{d.count} {t("studentsSuffix")}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-10 font-bold italic">{t("noProgressData")}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6">{t("topCourses")}</h3>
          {data.coursePerformance?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                    <th className="pb-3">{t("course")}</th>
                    <th className="pb-3">{t("enrolled")}</th>
                    <th className="pb-3">{t("completed")}</th>
                    <th className="pb-3">{t("avgScore")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.coursePerformance.map((c: any) => (
                    <tr key={c.courseId} className="border-b border-slate-50 last:border-0">
                      <td className="py-3 font-bold text-slate-700">{c.title}</td>
                      <td className="py-3 text-slate-500">{c.enrolledCount}</td>
                      <td className="py-3 text-slate-500">{c.completedCount}</td>
                      <td className="py-3 text-slate-500">{c.avgQuizScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-10 font-bold italic">{t("noCoursesYet")}</p>
          )}
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6">{t("teacherLeaderboard")}</h3>
          {data.teacherLeaderboard?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                    <th className="pb-3">{t("teacher")}</th>
                    <th className="pb-3">{t("students")}</th>
                    <th className="pb-3">{t("completion")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.teacherLeaderboard.map((tt: any) => (
                    <tr key={tt.teacherId} className="border-b border-slate-50 last:border-0">
                      <td className="py-3 font-bold text-slate-700">{tt.name}</td>
                      <td className="py-3 text-slate-500">{tt.studentCount}</td>
                      <td className="py-3 text-slate-500">{tt.completionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-10 font-bold italic">{t("noTeachersYet")}</p>
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-6">{t("quizPassRates")}</h3>
        {data.quizAnalytics?.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.quizAnalytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="title" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 }} />
              <Bar dataKey="passRate" fill="#16a34a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-400 text-center py-10 font-bold italic">{t("noQuizData")}</p>
        )}
      </div>
    </div>
  );
}
