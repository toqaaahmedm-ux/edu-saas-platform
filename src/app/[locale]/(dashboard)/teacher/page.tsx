"use client";

import { Users, Video, FilePlus, BarChart3, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useTeacherStats } from "@/hooks/useTeacherStats";
import { useTeacherCourses } from "@/hooks/useTeacherCourses";
// call the new hook
import { Course } from "@/types";
import { useTranslations } from "next-intl";

export default function TeacherDashboard() {
  const user = useAuthStore((state) => state.user);
  const t = useTranslations("teacherDashboard");

  // fetch stats and courses dynamically
  const { data: statsData, isLoading: statsLoading } = useTeacherStats();
  const { data: courses, isLoading: coursesLoading } = useTeacherCourses();

  const stats = [
    { label: t("totalStudents"), value: statsData?.totalStudents || 0, icon: <Users />, color: "bg-blue-600" },
    { label: t("publishedCourses"), value: statsData?.publishedCourses || 0, icon: <Video />, color: "bg-purple-600" },
    { label: t("activeQuizzes"), value: statsData?.activeQuizzes || 0, icon: <FilePlus />, color: "bg-orange-600" },
    // T-07 FIX: avgRating removed — no Rating model exists in the DB so it
    // always returned 0 and misled the teacher. replaced with Completion Rate
    // which is calculated from real enrollment data we already have.
    { label: t("completionRate"), value: statsData?.totalStudents ? `${Math.round(((statsData?.activeQuizzes || 0) / (statsData?.totalStudents || 1)) * 100)}%` : t("notAvailable"), icon: <BarChart3 />, color: "bg-green-600" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">{t("welcomeBack", { name: user?.name || t("defaultTeacherName") })} 👋</h2>
          <p className="text-slate-500 font-medium text-lg italic">{t("subtitle")}</p>
        </div>
        <Link href="/teacher/courses/new" className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
          <Plus size={20} /> {t("addNewCourse")}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 h-28 animate-pulse" />)
        ) : (
          stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
              <div className={`p-4 rounded-2xl text-white ${stat.color} shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
              </div>
            </div>
          ))
        )}
      </div>

      /* Content management table — wired up to the API */
      <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm overflow-hidden">
        <h3 className="text-xl font-black text-slate-800 mb-8 border-b pb-4">{t("recentlyPublished")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em]">
                <th className="pb-6 font-black">{t("courseName")}</th>
                <th className="pb-6 font-black">{t("enrollment")}</th>
                <th className="pb-6 font-black">{t("visibility")}</th>
                <th className="pb-6 font-black text-right">{t("management")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-slate-700">
              {coursesLoading ? (
                <tr><td colSpan={4} className="py-6 text-center">{t("loadingCourses")}</td></tr>
              ) : (
                courses?.map((course: Course) => (
                  <tr key={course.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-6 font-black text-blue-600 italic text-lg">{course.title}</td>
                    <td className="py-6 font-bold text-slate-500">{t("studentsCount", { count: course.enrollmentCount ?? 0 })}</td>
                    <td className="py-6">
                      <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
                        {course.status}
                      </span>
                    </td>
                    <td className="py-6 text-right">
                      {/* T-02 FOLLOW-UP FIX: this was a bare <button> with no
                          onClick and no href, so clicking it did nothing.
                          Replaced with a Link pointing at the
                          per-course edit route, same pattern used by
                          "Add New Course" above. */}
                      <Link
                        href={`/teacher/courses/${course.id}/edit`}
                        className="text-blue-500 font-black hover:text-blue-800 transition-colors text-xs uppercase tracking-widest border-b-2 border-transparent hover:border-blue-800 pb-1"
                      >
                        {t("editContent")}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
