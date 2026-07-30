"use client";
import { useState, useMemo } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { BookOpen, Search, GraduationCap, Loader2, CheckCircle2, ClipboardList, Award, SlidersHorizontal, CalendarCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { usePublicCourses } from "@/services/courses.service";
import { useEnrollments, useEnroll } from "@/services/enrollments.service";
import { useTranslations } from "next-intl";

export default function StudentCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const t = useTranslations("studentCourses");

  const SORT_OPTIONS = [
    { value: "newest", label: t("sortNewest") },
    { value: "price_asc", label: t("sortPriceAsc") },
    { value: "price_desc", label: t("sortPriceDesc") },
    { value: "title_asc", label: t("sortTitleAsc") },
  ];

  const { data: courses = [], isLoading } = usePublicCourses({
    search: searchTerm || undefined,
    category: activeCategory || undefined,
    sortBy,
  });
  const { data: enrolledCourses = [] } = useEnrollments();
  const { mutate: enroll } = useEnroll();

  const enrolledIds = new Set((enrolledCourses as any[]).map((e) => e.courseId));

  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c: any) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set).sort();
  }, [courses]);

  const handleEnroll = (courseId: string) => {
    setEnrollingId(courseId);
    enroll(courseId, {
      onSuccess: () => {
        toast.success(t("enrolledToast"));
        setEnrollingId(null);
      },
      onError: (err: any) => {
        toast.error(err.message || t("enrollFailed"));
        setEnrollingId(null);
      },
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left pb-10 w-full max-w-7xl mx-auto px-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-blue-50 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">{t("academicLibrary")}</h2>
            <p className="text-slate-500 font-medium italic">{t("subtitle")}</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              id="course-search"
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none transition-all font-bold text-sm placeholder:text-slate-300"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-50">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeCategory === null ? "bg-blue-600 text-white shadow-md" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                }`}
            >
              {t("all")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeCategory === cat ? "bg-blue-600 text-white shadow-md" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-slate-300" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-black text-slate-600 uppercase tracking-wider outline-none focus:border-blue-600 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-400 font-black tracking-widest uppercase text-xs">{t("loadingCourses")}</p>
        </div>
      ) : courses.length === 0 ? (
        <EmptyState title={t("noMatchingCourses")} description={t("noMatchingDescription")} icon={BookOpen} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {courses.map((course) => {
            const isEnrolled = enrolledIds.has(course.id);
            const isEnrolling = enrollingId === course.id;
            return (
              <div key={course.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col min-h-[480px] w-full">
                <div className="h-48 bg-blue-600 relative shrink-0 overflow-hidden">
                  {course.thumbnail ? (
                    <Image src={course.thumbnail} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={48} className="text-white opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-[0.1em] shadow-lg z-10">
                    {course.category}
                  </div>
                  {isEnrolled && (
                    <div className="absolute top-4 right-4 bg-emerald-500 px-3 py-1 rounded-full text-[10px] font-black text-white z-10 flex items-center gap-1">
                      <CheckCircle2 size={12} /> {t("enrolled")}
                    </div>
                  )}
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[56px]">{course.title}</h3>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2 font-medium leading-relaxed">{course.description}</p>
                  </div>
                  {isEnrolled && (
                    <div className="flex items-center gap-2 mb-4">
                      <Link
                        href={`/student/courses/${course.id}/assignments`}
                        title={t("assignments")}
                        className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-xl text-xs font-black hover:bg-indigo-100 transition"
                      >
                        <ClipboardList size={14} /> {t("assignments")}
                      </Link>
                      <Link
                        href={`/student/courses/${course.id}/grades`}
                        title={t("grade")}
                        className="flex items-center gap-2 bg-teal-50 text-teal-600 px-3 py-2 rounded-xl text-xs font-black hover:bg-teal-100 transition"
                      >
                        <Award size={14} /> {t("grade")}
                      </Link>
                      <Link
                        href={`/student/courses/${course.id}/attendance`}
                        title={t("attendance")}
                        className="flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-2 rounded-xl text-xs font-black hover:bg-amber-100 transition"
                      >
                        <CalendarCheck size={14} /> {t("attendance")}
                      </Link>
                    </div>
                  )}


                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <GraduationCap size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{t("instructor")}</p>
                        <p className="text-xs font-black text-slate-700">{(course.instructor as any)?.name || course.instructor}</p>
                      </div>
                    </div>
                    {isEnrolled ? (
                      <Link href={`/student/courses/${course.id}`} className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 shadow-lg transition-all active:scale-95">
                        {t("continue")}
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={isEnrolling}
                        title={t("enrollNow")}
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 shadow-lg transition-all active:scale-95 disabled:opacity-70"
                      >
                        {isEnrolling ? <Loader2 size={14} className="animate-spin" /> : t("enrollNow")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
