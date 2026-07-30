"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import {
  CalendarCheck,
  Loader2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useEnrollments } from "@/services/enrollments.service";
import { useTranslations } from "next-intl";

interface CourseAttendance {
  courseId: string;
  title: string;
  totalLessons: number;
  present: number;
  attendanceRate: number;
}

const AT_RISK_THRESHOLD = 75;

export default function StudentAttendanceOverviewPage() {
  const t = useTranslations("studentAttendanceOverview");
  const { data: enrollments = [], isLoading: enrollLoading } = useEnrollments();

  const [courses, setCourses] = useState<CourseAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (enrollLoading) return;
    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const active = (enrollments as any[]).filter((e) => !e.status || e.status === "ACTIVE");

        const results = await Promise.all(
          active.map(async (e) => {
            try {
              const res = await apiClient.get(`/courses/${e.courseId}/attendance/me`);
              const data = (res.data as any)?.data ?? res.data ?? {};
              return {
                courseId: e.courseId,
                title: e.course?.title || t("untitledCourse"),
                totalLessons: data.totalLessons ?? 0,
                present: data.present ?? 0,
                attendanceRate: data.attendanceRate ?? 0,
              } as CourseAttendance;
            } catch {
              // if one course fails to load, skip it rather than failing the whole page
              return null;
            }
          }),
        );

        setCourses(results.filter((r): r is CourseAttendance => r !== null));
      } catch {
        setLoadError(t("loadError"));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [enrollments, enrollLoading, t]);

  const coursesWithData = courses.filter((c) => c.totalLessons > 0);
  const totalLessons = coursesWithData.reduce((sum, c) => sum + c.totalLessons, 0);
  const totalPresent = coursesWithData.reduce((sum, c) => sum + c.present, 0);
  const overallRate = totalLessons > 0 ? Math.round((totalPresent / totalLessons) * 100) : 0;
  const isAtRisk = totalLessons > 0 && overallRate < AT_RISK_THRESHOLD;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8 animate-in fade-in duration-700 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
          <CalendarCheck size={26} className="text-emerald-500" /> {t("attendance")}
        </h1>
        <p className="text-slate-400 font-medium mt-1">{t("subtitle")}</p>
      </div>

      {isLoading || enrollLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : loadError ? (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 text-center">
          <AlertTriangle className="mx-auto text-red-400 mb-3" size={32} />
          <p className="text-red-500 font-bold">{loadError}</p>
        </div>
      ) : coursesWithData.length === 0 ? (
        <div className="bg-white p-16 rounded-[2.5rem] border border-slate-100 text-center">
          <CalendarCheck className="mx-auto text-slate-300 mb-4" size={40} />
          <p className="text-slate-400 font-black text-lg">{t("noAttendanceYet")}</p>
          <p className="text-slate-300 text-sm mt-2">{t("noAttendanceHint")}</p>
        </div>
      ) : (
        <>
          {isAtRisk && (
            <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-100 rounded-2xl">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={22} />
              <div>
                <p className="font-black text-red-700 text-sm">{t("belowThreshold", { threshold: AT_RISK_THRESHOLD })}</p>
                <p className="text-red-500 text-sm mt-1">{t("belowThresholdHint", { rate: overallRate })}</p>
              </div>
            </div>
          )}

          {/* Overall summary */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-8">
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-28 h-28 -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                  <circle
                    cx="56" cy="56" r="48"
                    stroke={isAtRisk ? "#ef4444" : "#10b981"}
                    strokeWidth="10" fill="none"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - overallRate / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-slate-800">{overallRate}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  {t("presentOutOf", { present: totalPresent, total: totalLessons })}
                </p>
                <p className="text-xs text-slate-400 mt-1">{t("acrossCourses", { count: coursesWithData.length })}</p>
              </div>
            </div>
          </div>

          {/* Per-course breakdown */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6">{t("byCoursesTitle")}</h3>
            <div className="space-y-3">
              {coursesWithData.map((c) => {
                const courseAtRisk = c.attendanceRate < AT_RISK_THRESHOLD;
                return (
                  <Link
                    key={c.courseId}
                    href={`/student/courses/${c.courseId}/attendance`}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition group"
                  >
                    <div>
                      <p className="font-black text-slate-700 text-sm">{c.title}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {t("presentOutOf", { present: c.present, total: c.totalLessons })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-black ${courseAtRisk ? "text-red-500" : "text-emerald-600"}`}>
                        {c.attendanceRate}%
                      </span>
                      <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
