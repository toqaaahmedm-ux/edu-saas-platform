"use client";
import { useState, useEffect } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { BookOpen, Search, GraduationCap, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useCourses } from "@/services/courses.service";
import { useEnrollments, useEnroll } from "@/services/enrollments.service";

export default function StudentCoursesPage() {
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: courses = [], isLoading } = useCourses();
  const { data: enrolledCourses = [] } = useEnrollments();
  const { mutate: enroll, isPending } = useEnroll();

  useEffect(() => { setIsClient(true); }, []);

 const enrolledIds = new Set((enrolledCourses as any[]).map((c) => c.id));

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnroll = (courseId: string) => {
    enroll(courseId, {
      onSuccess: () => toast.success("Enrolled successfully! 🎉"),
      onError: (err: any) => toast.error(err.message || "Failed to enroll"),
    });
  };

  if (!isClient) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left pb-10 w-full max-w-7xl mx-auto px-4">

      {/* Search Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-blue-50">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Academic Library</h2>
          <p className="text-slate-500 font-medium italic">Explore specialized medical courses from Ain Shams University doctors.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            id="course-search"
            type="text"
            placeholder="Find your next course..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none transition-all font-bold text-sm placeholder:text-slate-300"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-400 font-black tracking-widest uppercase text-xs">Loading Courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          title="No Matching Courses"
          description="Try searching with different keywords."
          icon={BookOpen}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledIds.has(course.id);
            return (
              <div
                key={course.id}
                className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col min-h-[480px] w-full"
              >
                <div className="h-48 bg-blue-600 relative shrink-0 overflow-hidden">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
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
                      <CheckCircle2 size={12} /> Enrolled
                    </div>
                  )}
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[56px]">
                      {course.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2 font-medium leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <GraduationCap size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Instructor</p>
                        <p className="text-xs font-black text-slate-700">{(course.instructor as any)?.name || course.instructor}</p>
                      </div>
                    </div>

                    {isEnrolled ? (
                      <Link
                        href={`/student/courses/${course.id}`}
                        className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 shadow-lg transition-all active:scale-95"
                      >
                        Continue
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={isPending}
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 shadow-lg transition-all active:scale-95 disabled:opacity-70"
                      >
                        {isPending ? <Loader2 size={14} className="animate-spin" /> : "Enroll Now"}
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