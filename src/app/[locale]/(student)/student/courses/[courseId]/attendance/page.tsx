"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CalendarCheck,
  Loader2,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";

interface AttendanceRecord {
  id: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  note: string | null;
  markedAt: string;
  lesson: {
    id: string;
    title: string;
    order: number;
  };
}

interface AttendanceSummary {
  records: AttendanceRecord[];
  totalLessons: number;
  present: number;
  attendanceRate: number;
}

const AT_RISK_THRESHOLD = 75;

// Tailwind's JIT scanner needs full literal class strings at build time —
// interpolating `bg-${color}-50` etc. would silently produce no styles at
// all, so each status carries its complete, pre-built className instead.
function statusMeta(status: AttendanceRecord["status"]) {
  switch (status) {
    case "PRESENT":
      return {
        label: "Present",
        icon: <CheckCircle2 size={16} />,
        rowClass: "bg-emerald-50/50 border-emerald-100",
        badgeClass: "bg-emerald-100 text-emerald-700",
      };
    case "LATE":
      return {
        label: "Late",
        icon: <Clock size={16} />,
        rowClass: "bg-amber-50/50 border-amber-100",
        badgeClass: "bg-amber-100 text-amber-700",
      };
    case "EXCUSED":
      return {
        label: "Excused",
        icon: <FileCheck size={16} />,
        rowClass: "bg-blue-50/50 border-blue-100",
        badgeClass: "bg-blue-100 text-blue-700",
      };
    case "ABSENT":
    default:
      return {
        label: "Absent",
        icon: <XCircle size={16} />,
        rowClass: "bg-red-50/50 border-red-100",
        badgeClass: "bg-red-100 text-red-700",
      };
  }
}

export default function StudentAttendancePage() {
  const { courseId } = useParams() as { courseId: string };
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [courseName, setCourseName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const [courseRes, attendanceRes] = await Promise.all([
          apiClient.get(`/courses/${courseId}`),
          apiClient.get(`/courses/${courseId}/attendance/me`),
        ]);
        setCourseName((courseRes.data as any)?.data?.title || "Course");
        const data = (attendanceRes.data as any)?.data ?? attendanceRes.data ?? null;
        setSummary(data);
      } catch (err: any) {
        setLoadError(
          err?.response?.status === 403
            ? "You must be enrolled in this course to view attendance."
            : "Couldn't load attendance right now."
        );
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [courseId]);

  const isAtRisk = summary && summary.totalLessons > 0 && summary.attendanceRate < AT_RISK_THRESHOLD;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center gap-4">
        <Link
          href={`/student/courses/${courseId}`}
          className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition"
        >
          <ChevronLeft size={20} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <CalendarCheck size={26} className="text-teal-500" /> Attendance
          </h1>
          <p className="text-slate-400 font-medium">{courseName}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : loadError ? (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 text-center">
          <AlertTriangle className="mx-auto text-red-400 mb-3" size={32} />
          <p className="text-red-500 font-bold">{loadError}</p>
        </div>
      ) : !summary || summary.totalLessons === 0 ? (
        <div className="bg-white p-16 rounded-[2.5rem] border border-slate-100 text-center">
          <CalendarCheck className="mx-auto text-slate-300 mb-4" size={40} />
          <p className="text-slate-400 font-black text-lg">No attendance recorded yet</p>
          <p className="text-slate-300 text-sm mt-2">Your instructor hasn't taken attendance for any lesson in this course.</p>
        </div>
      ) : (
        <>
          <div className={`p-8 rounded-[2.5rem] border shadow-sm ${isAtRisk ? "bg-red-50 border-red-100" : "bg-white border-slate-100"}`}>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative w-32 h-32 shrink-0">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={isAtRisk ? "#ef4444" : "#10b981"}
                    strokeWidth="12"
                    strokeDasharray={`${(summary.attendanceRate / 100) * 326.7} 326.7`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-800">{summary.attendanceRate}%</span>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-black text-slate-500 uppercase tracking-wider mb-1">
                  {summary.present} of {summary.totalLessons} lessons attended
                </p>
                {isAtRisk ? (
                  <div className="flex items-center gap-2 text-red-600 font-black mt-2">
                    <AlertTriangle size={20} />
                    <span>At risk — attendance is below {AT_RISK_THRESHOLD}%</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600 font-black mt-2">
                    <CheckCircle2 size={20} />
                    <span>You're on track</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6">Lesson History</h3>
            <div className="space-y-3">
              {summary.records.map((r) => {
                const meta = statusMeta(r.status);
                return (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border ${meta.rowClass}`}
                  >
                    <div>
                      <p className="font-black text-slate-700 text-sm">{r.lesson.title}</p>
                      {r.note && <p className="text-xs text-slate-400 mt-1">{r.note}</p>}
                    </div>
                    <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${meta.badgeClass}`}>
                      {meta.icon} {meta.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}