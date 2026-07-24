"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, Loader2, Award, PlayCircle } from "lucide-react";
import { useEnrollments } from "@/services/enrollments.service";
import { EmptyState } from "@/components/shared/EmptyState";

function getCourseTitle(enrollment: any): string {
  if (typeof enrollment?.course?.title === "string") return enrollment.course.title;
  return "Untitled course";
}

function getInstructorName(enrollment: any): string {
  const instructor = enrollment?.course?.instructor;
  if (typeof instructor === "string") return instructor;
  return instructor?.name || "Unknown instructor";
}

export default function MyCoursesPage() {
  const { data: enrollments = [], isLoading } = useEnrollments();
  const [tab, setTab] = useState<"active" | "completed">("active");

  const list = enrollments as any[];
  const active = list.filter((e) => e.status !== "COMPLETED");
  const completed = list.filter((e) => e.status === "COMPLETED");
  const shown = tab === "active" ? active : completed;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-400 font-black tracking-widest uppercase text-xs">Loading Your Courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left pb-10 w-full max-w-7xl mx-auto px-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-blue-50">
        <h2 className="text-3xl font-black text-slate-800 mb-2">My Courses</h2>
        <p className="text-slate-500 font-medium italic">Everything you're enrolled in, in one place.</p>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setTab("active")}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${
              tab === "active" ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            }`}
          >
            <PlayCircle size={18} /> Active ({active.length})
          </button>
          <button
            onClick={() => setTab("completed")}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${
              tab === "completed" ? "bg-emerald-600 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            }`}
          >
            <CheckCircle2 size={18} /> Completed ({completed.length})
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          title={tab === "active" ? "No active courses" : "No completed courses yet"}
          description={tab === "active" ? "Browse the library and enroll in a course to get started." : "Finish an active course to see it here."}
          icon={BookOpen}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {shown.map((enrollment: any) => {
            const progress = enrollment.progress ?? 0;
            const isCompleted = enrollment.status === "COMPLETED";
            const isPassing = progress >= 70;
            return (
              <Link
                key={enrollment.id}
                href={`/student/courses/${enrollment.courseId ?? enrollment.course?.id}`}
                className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-400 w-full" />
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {enrollment.course?.category && (
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-3 inline-block">
                        {enrollment.course.category}
                      </span>
                    )}
                    <h3 className="text-lg font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {getCourseTitle(enrollment)}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold mb-4">
                      Instructor: <span className="text-slate-600">{getInstructorName(enrollment)}</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-blue-600"}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-500">{progress}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full">
                          <CheckCircle2 size={12} /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full">
                          <PlayCircle size={12} /> In Progress
                        </span>
                      )}
                      {isPassing && (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full">
                          <Award size={12} /> On Track
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
