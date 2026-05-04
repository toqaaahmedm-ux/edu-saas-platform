"use client";
import { useQuizStore } from "@/store/useQuizStore";
import { useTeacherStore } from "@/store/useTeacherStore";
import { useAuthStore } from "@/store/useAuthStore";
import { BookOpen, Award, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { COURSES } from "@/data/courses.data";

export default function StudentDashboard() {
  const { isFinished } = useQuizStore();
  const teacherCourses = useTeacherStore((state) => state.courses);
  const user = useAuthStore((state) => state.user);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const allCourses = [...COURSES, ...teacherCourses];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left">
      {/* 1. Header Area */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-blue-50 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            Welcome back, {user?.name || "Student"} 👋
          </h2>
          <p className="text-slate-500 font-medium text-lg italic">
            Check your latest educational updates.
          </p>
        </div>
        <div className="hidden md:flex w-20 h-20 bg-blue-50 rounded-full items-center justify-center text-3xl border-2 border-white shadow-sm">
          🎓
        </div>
      </div>

      {/* 2. Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Enrolled Courses", value: allCourses.length, icon: <BookOpen />, color: "bg-blue-600" },
          { label: "Certificates", value: isFinished ? "1" : "0", icon: <Award />, color: "bg-green-600" },
          { label: "Learning Hours", value: "12.5h", icon: <Clock />, color: "bg-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className={`p-4 rounded-2xl text-white ${stat.color} shadow-lg shadow-current/20`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3. My Courses Progress */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800">My Courses Progress</h3>
            <Link href="/student/courses" className="text-blue-600 font-bold text-sm hover:underline">View All</Link>
          </div>
          <div className="space-y-5">
            {allCourses.slice(0, 3).map((course) => (
              <div key={course.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white transition-all group">
                <div className="flex justify-between mb-3 font-bold text-slate-700">
                  <span className="truncate max-w-[200px]">{course.title}</span>
                  <span className="text-blue-600">45%</span>
                </div>
                {/* الحل البروفيشنال المعتمد من المهندس حافظ: منع الـ Inline Style تماماً */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all duration-1000 w-[45%]"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Recent Quiz Results */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6">Recent Quizzes</h3>
          <div className="flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed border-slate-100 rounded-3xl">
            {isFinished ? (
              <div className="w-full px-4 flex justify-between items-center font-bold text-slate-600 p-3 bg-slate-50 rounded-xl group cursor-pointer hover:bg-slate-100 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Medical Assessment Quiz</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-xs px-3 py-1 bg-green-100 rounded-full">Passed</span>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ) : (
              <div className="text-center space-y-1 text-slate-400">
                <p className="text-sm font-bold">No quizzes completed yet</p>
                <p className="text-xs italic tracking-tight">Complete your lessons to unlock assessments.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
