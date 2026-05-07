"use client";

import { Users, Video, FilePlus, BarChart3, Plus } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore"; // جلب بيانات المدرس
import { COURSES } from "@/data/courses.data"; // ربط بيانات الكورسات المركزية

export default function TeacherDashboard() {
  const user = useAuthStore((state) => state.user); // حل BUG-13 ديناميكياً

  const stats = [
    { label: "Total Students", value: "1,250", icon: <Users />, color: "bg-blue-600" },
    { label: "Published Courses", value: COURSES.length.toString(), icon: <Video />, color: "bg-purple-600" },
    { label: "Active Quizzes", value: "12", icon: <FilePlus />, color: "bg-orange-600" },
    { label: "Average Rating", value: "4.9", icon: <BarChart3 />, color: "bg-green-600" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 text-left">
      
      {/* Header مع تحية ديناميكية باسم المدرس */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            Welcome back, {user?.name || "Doctor"} 👋
          </h2>
          <p className="text-slate-500 font-medium text-lg italic">
            Empower your students at Ain Shams University with new content.
          </p>
        </div>
        <Link 
          href="/teacher/courses/new" 
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus size={20} /> Add New Course
        </Link>
      </div>

      {/* Stats Cards - Updated to reflect real data count */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
            <div className={`p-4 rounded-2xl text-white ${stat.color} shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Content Management Table - Dynamic Data Loop */}
      <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm overflow-hidden">
        <h3 className="text-xl font-black text-slate-800 mb-8 border-b pb-4">Recently Published Courses</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em]">
                <th className="pb-6 font-black">Course Name</th>
                <th className="pb-6 font-black">Enrollment</th>
                <th className="pb-6 font-black">Visibility</th>
                <th className="pb-6 font-black text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-slate-700">
              {COURSES.slice(0, 3).map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-6 font-black text-blue-600 italic text-lg">{course.title}</td>
                  <td className="py-6 font-bold text-slate-500">450 Students</td>
                  <td className="py-6">
                    <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
                      Live
                    </span>
                  </td>
                  <td className="py-6 text-right">
                    <button className="text-blue-500 font-black hover:text-blue-800 transition-colors text-xs uppercase tracking-widest border-b-2 border-transparent hover:border-blue-800 pb-1">
                      Edit Content
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
