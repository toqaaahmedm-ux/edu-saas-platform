"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import {
  ClipboardList,
  Loader2,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useEnrollments } from "@/services/enrollments.service";
import { useTranslations } from "next-intl";

interface Assignment {
  id: string;
  dueDate: string | null;
  isPublished: boolean;
}

interface CourseAssignments {
  courseId: string;
  title: string;
  total: number;
  graded: number;
  submitted: number;
  overdue: number;
  pending: number;
}

export default function StudentAssignmentsOverviewPage() {
  const t = useTranslations("studentAssignmentsOverview");
  const { data: enrollments = [], isLoading: enrollLoading } = useEnrollments();

  const [courses, setCourses] = useState<CourseAssignments[]>([]);
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
              const res = await apiClient.get(`/courses/${e.courseId}/assignments`);
              const data = (res.data as any)?.data ?? res.data ?? [];
              const published: Assignment[] = (Array.isArray(data) ? data : []).filter((a: any) => a.isPublished);

              const submissions = await Promise.all(
                published.map((a) =>
                  apiClient
                    .get(`/courses/${e.courseId}/assignments/${a.id}/submissions/me`)
                    .then((r) => (r.data as any)?.data ?? r.data ?? null)
                    .catch(() => null),
                ),
              );

              let graded = 0, submitted = 0, overdue = 0, pending = 0;
              published.forEach((a, i) => {
                const s = submissions[i];
                const isPast = a.dueDate ? new Date(a.dueDate).getTime() < Date.now() : false;
                if (s?.status === "GRADED") graded++;
                else if (s?.status === "SUBMITTED") submitted++;
                else if (isPast) overdue++;
                else pending++;
              });

              return {
                courseId: e.courseId,
                title: e.course?.title || t("untitledCourse"),
                total: published.length,
                graded,
                submitted,
                overdue,
                pending,
              } as CourseAssignments;
            } catch {
              return null;
            }
          }),
        );

        setCourses(results.filter((r): r is CourseAssignments => r !== null));
      } catch {
        setLoadError(t("loadError"));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [enrollments, enrollLoading, t]);

  const coursesWithData = courses.filter((c) => c.total > 0);
  const totals = coursesWithData.reduce(
    (acc, c) => ({
      total: acc.total + c.total,
      graded: acc.graded + c.graded,
      submitted: acc.submitted + c.submitted,
      overdue: acc.overdue + c.overdue,
      pending: acc.pending + c.pending,
    }),
    { total: 0, graded: 0, submitted: 0, overdue: 0, pending: 0 },
  );

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8 animate-in fade-in duration-700 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
          <ClipboardList size={26} className="text-indigo-500" /> {t("assignments")}
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
          <ClipboardList className="mx-auto text-slate-300 mb-4" size={40} />
          <p className="text-slate-400 font-black text-lg">{t("noAssignmentsYet")}</p>
          <p className="text-slate-300 text-sm mt-2">{t("noAssignmentsHint")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-2xl font-black text-slate-800">{totals.total}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-1">{t("total")}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-2xl font-black text-emerald-600">{totals.graded}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-1">{t("graded")}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-2xl font-black text-blue-600">{totals.submitted}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-1">{t("submitted")}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-2xl font-black text-red-500">{totals.overdue}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-1">{t("overdue")}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6">{t("byCoursesTitle")}</h3>
            <div className="space-y-3">
              {coursesWithData.map((c) => (
                <Link
                  key={c.courseId}
                  href={`/student/courses/${c.courseId}/assignments`}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition group"
                >
                  <div>
                    <p className="font-black text-slate-700 text-sm">{c.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {c.graded > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                          <CheckCircle2 size={12} /> {t("gradedCount", { count: c.graded })}
                        </span>
                      )}
                      {c.submitted > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-blue-600">
                          <Clock size={12} /> {t("submittedCount", { count: c.submitted })}
                        </span>
                      )}
                      {c.overdue > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-red-500">
                          <AlertCircle size={12} /> {t("overdueCount", { count: c.overdue })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-400">{t("ofTotal", { total: c.total })}</span>
                    <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
