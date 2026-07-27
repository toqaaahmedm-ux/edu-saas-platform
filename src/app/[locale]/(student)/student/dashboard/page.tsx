"use client";
import { useAuthStore } from "@/store/useAuthStore";
import { BookOpen, Award, Clock, ChevronRight, Loader2, ClipboardList, Radio, PlayCircle, CalendarClock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useEnrollments } from "@/services/enrollments.service";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";

function getCourseTitle(course: any): string {
  if (typeof course?.course?.title === "string") return course.course.title;
  if (typeof course?.title === "string") return course.title;
  return "Untitled course";
}

interface DeadlineItem {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  dueDate: string;
}

interface LiveSessionItem {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  liveAt: string;
  liveUrl: string | null;
}

export default function StudentDashboard() {
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("studentDashboard");
  const locale = useLocale();

  useEffect(() => { setMounted(true); }, []);

  const { data: enrolledCourses = [], isLoading } = useEnrollments();

  const { data: certificates = [], isLoading: certsLoading } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: async () => {
      const res = await apiClient.get('/certificates/my');
      return res.data?.data ?? [];
    },
    enabled: !!user,
  });

  // Sprint 2 / Task #10: aggregate upcoming assignment deadlines and live
  // sessions across every enrolled course. No dedicated cross-course
  // endpoint exists for either yet, so this fans out per-course requests
  // (fine at typical enrollment counts) and filters/sorts client-side.
  const courseList = enrolledCourses as any[];
  const courseIds = courseList.map((e) => e.courseId ?? e.course?.id).filter(Boolean);

  const { data: deadlines = [], isLoading: deadlinesLoading } = useQuery({
    queryKey: ['dashboard-deadlines', courseIds],
    queryFn: async () => {
      const results = await Promise.all(
        courseList.map(async (enr) => {
          const cId = enr.courseId ?? enr.course?.id;
          try {
            const res = await apiClient.get(`/courses/${cId}/assignments`);
            const data = (res.data as any)?.data ?? res.data ?? [];
            return (Array.isArray(data) ? data : [])
              .filter((a: any) => a.isPublished && a.dueDate)
              .map((a: any) => ({
                id: a.id,
                title: a.title,
                courseId: cId,
                courseTitle: getCourseTitle(enr),
                dueDate: a.dueDate,
              }));
          } catch {
            return [];
          }
        })
      );
      const flat: DeadlineItem[] = results.flat();
      const now = Date.now();
      const soon = now + 7 * 24 * 60 * 60 * 1000;
      return flat
        .filter((d) => {
          const t = new Date(d.dueDate).getTime();
          return t >= now && t <= soon;
        })
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);
    },
    enabled: courseIds.length > 0,
  });

  const { data: liveSessions = [], isLoading: liveLoading } = useQuery({
    queryKey: ['dashboard-live-sessions', courseIds],
    queryFn: async () => {
      const results = await Promise.all(
        courseList.map(async (enr) => {
          const cId = enr.courseId ?? enr.course?.id;
          try {
            const res = await apiClient.get(`/courses/${cId}/lessons`);
            const data = (res.data as any)?.data ?? res.data ?? [];
            return (Array.isArray(data) ? data : [])
              .filter((l: any) => l.type === 'LIVE_SESSION' && l.liveAt)
              .map((l: any) => ({
                id: l.id,
                title: l.title,
                courseId: cId,
                courseTitle: getCourseTitle(enr),
                liveAt: l.liveAt,
                liveUrl: l.liveUrl ?? null,
              }));
          } catch {
            return [];
          }
        })
      );
      const flat: LiveSessionItem[] = results.flat();
      const now = Date.now();
      return flat
        .filter((s) => new Date(s.liveAt).getTime() >= now)
        .sort((a, b) => new Date(a.liveAt).getTime() - new Date(b.liveAt).getTime())
        .slice(0, 5);
    },
    enabled: courseIds.length > 0,
  });

  const avgProgress = courseList.length > 0
    ? Math.round(courseList.reduce((s: number, e: any) => s + (e.progress || 0), 0) / courseList.length)
    : 0;

  // "Continue Learning" hero: the enrolled, not-yet-completed course with
  // the most progress already made — the one closest to being finished.
  const continueLearningCourse = [...courseList]
    .filter((e) => e.status !== "COMPLETED")
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))[0];

  const stats = [
    { label: t("enrolledCourses"), value: isLoading ? "..." : courseList.length, icon: <BookOpen />, color: "bg-blue-600" },
    { label: t("earnedCertificates"), value: certsLoading ? "..." : (certificates as any[]).length, icon: <Award />, color: "bg-emerald-600" },
    { label: t("avgProgress"), value: isLoading ? "..." : `${avgProgress}%`, icon: <Clock />, color: "bg-purple-600" },
    { label: "Upcoming Deadlines", value: deadlinesLoading ? "..." : deadlines.length, icon: <ClipboardList />, color: "bg-amber-600" },
    { label: "Live Sessions", value: liveLoading ? "..." : liveSessions.length, icon: <Radio />, color: "bg-rose-600" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 text-left pb-10">

      <div className="flex justify-between items-center bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            {t("welcomeBack", { name: user?.name || "Student" })} 👋
          </h2>
          <p className="text-slate-500 font-medium text-lg italic">
            {t("subtitle")}
          </p>
        </div>
        <div className="hidden md:flex w-24 h-24 bg-blue-50 rounded-[2rem] items-center justify-center text-4xl shadow-inner border-4 border-white">🎓</div>
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {mounted && !isLoading && continueLearningCourse && (
        <Link
          href={`/student/courses/${continueLearningCourse.courseId ?? continueLearningCourse.course?.id}`}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group hover:shadow-2xl transition-all"
        >
          <div className="relative z-10 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-2">Continue Learning</p>
            <h3 className="text-2xl font-black mb-3">{getCourseTitle(continueLearningCourse)}</h3>
            <div className="flex items-center gap-3 max-w-sm">
              <div className="flex-1 bg-white/20 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${continueLearningCourse.progress || 0}%` }}
                />
              </div>
              <span className="text-xs font-black">{continueLearningCourse.progress || 0}%</span>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-2xl font-black text-sm group-hover:bg-blue-50 transition-all shrink-0">
            <PlayCircle size={20} /> Resume
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </Link>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-5 shadow-sm hover:shadow-xl transition-all group">
            <div className={`p-4 md:p-5 rounded-2xl text-white ${stat.color} shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{stat.label}</p>
              <h3 suppressHydrationWarning className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-lg">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <ClipboardList size={20} className="text-amber-500" /> Upcoming Deadlines
            </h3>
          </div>
          {!mounted || deadlinesLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : deadlines.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <CalendarClock className="mx-auto text-slate-300" size={32} />
              <p className="text-slate-400 font-bold text-sm">Nothing due in the next 7 days.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deadlines.map((d) => (
                <Link
                  key={d.id}
                  href={`/student/courses/${d.courseId}/assignments`}
                  className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/50 border border-amber-100 hover:bg-amber-50 transition-all"
                >
                  <div>
                    <p className="font-black text-slate-700 text-sm">{d.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{d.courseTitle}</p>
                  </div>
                  <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full uppercase">
                    {new Date(d.dueDate).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { month: "short", day: "numeric" })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-lg">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Radio size={20} className="text-rose-500" /> Live Sessions
            </h3>
          </div>
          {!mounted || liveLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : liveSessions.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Radio className="mx-auto text-slate-300" size={32} />
              <p className="text-slate-400 font-bold text-sm">No upcoming live sessions.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liveSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                  <div>
                    <p className="font-black text-slate-700 text-sm">{s.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{s.courseTitle}</p>
                  </div>
                  {s.liveUrl ? (
                    <a
                      href={s.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-black text-white bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-full uppercase transition"
                    >
                      Join
                    </a>
                  ) : (
                    <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-3 py-1.5 rounded-full uppercase">
                      {new Date(s.liveAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-lg">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h3 className="text-xl font-black text-slate-800">{t("myCourses")}</h3>
            <Link href="/student/courses" className="text-blue-600 font-black text-xs uppercase tracking-widest hover:text-blue-800 transition-colors">
              {t("exploreMore")}
            </Link>
          </div>

          {!mounted || isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : courseList.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <BookOpen size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold">{t("noCoursesYet")}</p>
              <Link href="/student/courses" className="inline-block text-blue-600 font-black text-xs uppercase tracking-widest border-b-2 border-blue-600 pb-1">
                {t("browseCourses")}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {courseList.slice(0, 3).map((course: any) => {
                const progress = course.progress || 0;
                return (
                  <Link
                    key={course.id}
                    href={`/student/courses/${course.courseId ?? course.id}`}
                    className="block p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-100 transition-all group"
                  >
                    <div className="flex justify-between mb-4 font-black text-slate-700">
                      <span className="truncate max-w-[250px] italic">{getCourseTitle(course)}</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full transition-all duration-1000 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-2">{t("complete", { progress })}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-lg">
          <h3 className="text-xl font-black text-slate-800 mb-8 border-b pb-4">{t("myCertificates")}</h3>
          <div className="flex flex-col items-center justify-center min-h-[220px] bg-slate-50/30 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
            {!mounted || certsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : (certificates as any[]).length > 0 ? (
              <div className="w-full px-6 space-y-3">
                {(certificates as any[]).slice(0, 3).map((cert: any) => (
                  <div key={cert.id} className="flex justify-between items-center p-5 bg-white rounded-2xl shadow-sm border border-emerald-100">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800">{cert.examName}</span>
                        <span suppressHydrationWarning className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                          {new Date(cert.issuedAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <span className="text-emerald-700 text-[10px] font-black uppercase px-4 py-1.5 bg-emerald-100 rounded-full tracking-wider">{t("earned")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center space-y-3 px-6">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto">
                  <BookOpen size={32} />
                </div>
                <div>
                  <p className="text-slate-500 font-black text-lg">{t("noQuizzesCompleted")}</p>
                  <p className="text-slate-400 text-xs font-medium italic">{t("finishLessons")}</p>
                </div>
                <Link href="/student/courses" className="inline-block mt-4 text-blue-600 font-black text-xs uppercase tracking-widest border-b-2 border-blue-600 pb-1">
                  {t("startLesson")}
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}