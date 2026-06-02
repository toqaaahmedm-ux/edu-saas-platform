"use client";
import { useQuizStore } from "@/store/useQuizStore";
import { useAuthStore } from "@/store/useAuthStore";
import { BookOpen, Award, Clock, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useEnrollments } from "@/services/enrollments.service";

export default function StudentDashboard() {
  const { isFinished } = useQuizStore();
  const user = useAuthStore((state) => state.user);
  const [isClient, setIsClient] = useState(false);

  // ✅ جلب الكورسات المسجل فيها بس بدل كل الكورسات
  const { data: enrolledCourses = [], isLoading } = useEnrollments();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const stats = [
    { label: "Enrolled Courses", value: isLoading ? "..." : enrolledCourses.length, icon: <BookOpen />, color: "bg-blue-600" },
    { label: "Earned Certificates", value: isFinished ? "1" : "0", icon: <Award />, color: "bg-emerald-600" },
    { label: "Learning Hours", value: "12.5h", icon: <Clock />, color: "bg-purple-600" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 text-left pb-10">

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            Welcome back, {user?.name || "Student"} 👋
          </h2>
          <p className="text-slate-500 font-medium text-lg italic">
            Keep pushing forward! Your medical journey is inspiring.
          </p>
        </div>
        <div className="hidden md:flex w-24 h-24 bg-blue-50 rounded-[2rem] items-center justify-center text-4xl shadow-inner border-4 border-white">
          🎓
        </div>
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-5 shadow-sm hover:shadow-xl transition-all group">
            <div className={`p-5 rounded-2xl text-white ${stat.color} shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Enrolled Courses */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-lg">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h3 className="text-xl font-black text-slate-800">My Courses</h3>
            <Link href="/student/courses" className="text-blue-600 font-black text-xs uppercase tracking-widest hover:text-blue-800 transition-colors">
              Explore More
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <BookOpen size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold">No courses yet.</p>
              <Link href="/student/courses" className="inline-block text-blue-600 font-black text-xs uppercase tracking-widest border-b-2 border-blue-600 pb-1">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {enrolledCourses.slice(0, 3).map((course: any) => (
                <Link
                  key={course.id}
                  href={`/student/courses/${course.id}`}
                  className="block p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-100 transition-all group"
                >
                  <div className="flex justify-between mb-4 font-black text-slate-700">
                    <span className="truncate max-w-[250px] italic">{course.title}</span>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-1000 w-[45%] rounded-full"></div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-2">45% Complete</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Assessments */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-lg">
          <h3 className="text-xl font-black text-slate-800 mb-8 border-b pb-4">Recent Assessments</h3>
          <div className="flex flex-col items-center justify-center min-h-[220px] bg-slate-50/30 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
            {isFinished ? (
              <div className="w-full px-6 flex justify-between items-center p-5 bg-white rounded-2xl shadow-sm border border-emerald-100 group cursor-pointer hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <div className="flex flex-col">
                    <span className="font-black text-slate-800">Final Anatomy Exam</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Completed recently</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-700 text-[10px] font-black uppercase px-4 py-1.5 bg-emerald-100 rounded-full tracking-wider">Passed</span>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 px-6">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto">
                  <BookOpen size={32} />
                </div>
                <div>
                  <p className="text-slate-500 font-black text-lg">No Quizzes Completed</p>
                  <p className="text-slate-400 text-xs font-medium italic">Finish your lessons to unlock your medical exams.</p>
                </div>
                <Link href="/student/courses" className="inline-block mt-4 text-blue-600 font-black text-xs uppercase tracking-widest border-b-2 border-blue-600 pb-1">
                  Start a Lesson
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}