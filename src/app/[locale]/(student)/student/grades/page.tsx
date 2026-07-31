"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import {
  Award,
  Loader2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useEnrollments } from "@/services/enrollments.service";
import { useTranslations } from "next-intl";

interface CourseGrade {
  courseId: string;
  title: string;
  score: number;
  letterGrade: string | null;
  gpa: number | null;
}

export default function StudentGradesOverviewPage() {
  const t = useTranslations("studentGradesOverview");
  const { data: enrollments = [], isLoading: enrollLoading } = useEnrollments();

  const [courses, setCourses] = useState<CourseGrade[]>([]);
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
              const res = await apiClient.get(`/courses/${e.courseId}/grades/me`);
              const data = (res.data as any)?.data ?? res.data ?? null;
              if (!data) return null; // no grade calculated for this course yet
              return {
                courseId: e.courseId,
                title: e.course?.title || t("untitledCourse"),
                score: Number(data.score),
                letterGrade: data.letterGrade ?? null,
                gpa: data.gpa != null ? Number(data.gpa) : null,
              } as CourseGrade;
            } catch {
              return null;
            }
          }),
        );

        setCourses(results.filter((r): r is CourseGrade => r !== null));
      } catch {
        setLoadError(t("loadError"));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [enrollments, enrollLoading, t]);

  const averageScore = courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + c.score, 0) / courses.length)
    : 0;
  const gpaCourses = courses.filter((c) => c.gpa != null);
  const averageGpa = gpaCourses.length > 0
    ? (gpaCourses.reduce((sum, c) => sum + (c.gpa as number), 0) / gpaCourses.length).toFixed(2)
    : null;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8 animate-in fade-in duration-700 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
          <Award size={26} className="text-blue-600" /> {t("grades")}
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
      ) : courses.length === 0 ? (
        <div className="bg-white p-16 rounded-[2.5rem] border border-slate-100 text-center">
          <Award className="mx-auto text-slate-300 mb-4" size={40} />
          <p className="text-slate-400 font-black text-lg">{t("noGradesYet")}</p>
          <p className="text-slate-300 text-sm mt-2">{t("noGradesHint")}</p>
        </div>
      ) : (
        <>
          {/* Overall summary */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 text-blue-700 text-3xl font-black shrink-0">
                {averageScore}%
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{t("averageAcross", { count: courses.length })}</p>
                {averageGpa != null && (
                  <p className="flex items-center gap-1 text-slate-400 text-sm mt-1">
                    <TrendingUp size={14} /> {t("averageGpa", { gpa: averageGpa })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Per-course breakdown */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6">{t("byCoursesTitle")}</h3>
            <div className="space-y-3">
              {courses.map((c) => (
                <Link
                  key={c.courseId}
                  href={`/student/courses/${c.courseId}/grades`}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 font-black flex items-center justify-center shrink-0">
                      {c.letterGrade || "—"}
                    </div>
                    <div>
                      <p className="font-black text-slate-700 text-sm">{c.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{c.score}%</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
