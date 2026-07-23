"use client";
import { FileWarning, TrendingUp, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAcademicOverview } from "@/services/academic-overview.service";

export default function AdminReportsPage() {
  const { data, isLoading } = useAcademicOverview();

  const atRiskStudents = data?.atRiskStudents || [];
  const coursePassRates = data?.coursePassRates || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left">
      <div>
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <TrendingUp className="text-blue-600" size={32} />
          Academic Reports
        </h2>
        <p className="text-slate-400 font-medium mt-1">
          At-risk students and course pass rates across your organization.
        </p>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="text-red-500" size={24} />
          <h3 className="text-xl font-black text-slate-800">At-Risk Students</h3>
          <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold">
            {atRiskStudents.length}
          </span>
        </div>

        {atRiskStudents.length === 0 ? (
          <div className="text-center py-10">
            <CheckCircle2 className="mx-auto text-emerald-300 mb-3" size={40} />
            <p className="text-slate-400 font-bold italic">
              No at-risk students right now. Everyone is on track!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {atRiskStudents.map((s: any) => (
              <div
                key={s.studentId}
                className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-4 bg-red-50 rounded-2xl border border-red-100"
              >
                <div>
                  <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.email}</p>
                </div>
                <span className="text-xs font-bold text-red-600 bg-white px-3 py-1 rounded-full border border-red-200">
                  {s.reason}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <FileWarning className="text-blue-500" size={24} />
          <h3 className="text-xl font-black text-slate-800">Course Pass Rates</h3>
        </div>

        {coursePassRates.length === 0 ? (
          <p className="text-slate-400 text-center py-10 font-bold italic">
            No courses with grades yet.
          </p>
        ) : (
          <div className="space-y-3">
            {coursePassRates.map((c: any) => (
              <div
                key={c.courseId}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <div>
                  <p className="font-bold text-slate-800 text-sm">{c.title}</p>
                  <p className="text-xs text-slate-400">{c.totalGraded} students graded</p>
                </div>
                {c.passRate !== null ? (
                  <span
                    className={`text-sm font-black px-4 py-2 rounded-xl ${
                      c.passRate >= 70
                        ? "bg-emerald-100 text-emerald-700"
                        : c.passRate >= 50
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {c.passRate}% Pass Rate
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 italic">No grades yet</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
