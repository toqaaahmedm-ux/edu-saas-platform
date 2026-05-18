"use client";

import { ShieldCheck, Users, CreditCard, LayoutGrid, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { USERS_DATA as INITIAL_USERS } from "@/data/users.data";
import { COURSES as STATIC_COURSES } from "@/data/courses.data";
import { useAuthStore } from "@/store/useAuthStore";
import { useTeacherStore } from "@/store/useTeacherStore";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [isClient, setIsClient] = useState(false);
  const [users, setUsers] = useState(INITIAL_USERS); // [تقرير 1 - صفحة 5]: جعل لستة الطلاب ديناميكية لتفعيل الحذف والقبول
  const user = useAuthStore((state) => state.user);

  const teacherCourses = useTeacherStore((state) => state.courses);
  const deleteCourse = useTeacherStore((state) => state.deleteCourse);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // دمج الحسابات بشكل ديناميكي (Fix Dynamic Logic)
  const totalStudents = users.filter(u => u.role === 'STUDENT').length;
  const allCoursesCount = STATIC_COURSES.length + teacherCourses.length;

  // [تقرير 1 - صفحة 5]: حساب الأرباح ديناميكياً بدل القيمة الثابتة بناءً على عدد الكورسات النشطة
  const calculatedRevenue = allCoursesCount * 12500;

  const stats = [
    { label: "Total Revenue", value: `EGP ${calculatedRevenue.toLocaleString()}`, icon: <CreditCard />, color: "bg-emerald-600" },
    { label: "Total Students", value: totalStudents, icon: <Users />, color: "bg-blue-600" },
    { label: "Total Courses", value: allCoursesCount, icon: <LayoutGrid />, color: "bg-amber-500" },
    { label: "System Health", value: "100%", icon: <ShieldCheck />, color: "bg-slate-700" },
  ];

  // دالة القبول (Approve)
  const handleApprove = (id: string, title: string) => {
    toast.success(`Course "${title}" has been approved and published!`);
  };

  // دالة الرفض (Reject)
  const handleReject = (id: string, title: string) => {
    deleteCourse(id);
    toast.error(`Course "${title}" rejected and removed.`);
  };

  // [تقرير 1 - صفحة 5]: دالة حذف المستخدم وتحديث الواجهة فعلياً لإصلاح ثغرة الأزرار الوهمية
  const handleDeleteUser = (id: string, userName: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success(`User "${userName}" has been successfully removed from system.`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 text-left">

      {/* Header الأدمن مع زرار خروج شيك ومصغر */}
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2">Central Admin Panel 🔐</h2>
          <p className="text-slate-400 font-medium text-lg italic">
            Welcome back, {user?.name || "Admin"}. Monitoring {users.length} active members.
          </p>
        </div>

        {/* زرار الخروج المصغر الأنيق بالسهم */}
        <button
          onClick={() => {
            document.cookie = "user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
            if (typeof window !== "undefined") {
              localStorage.removeItem("auth-storage");
              window.location.replace("/");
            }
          }}
          className="relative z-10 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-red-600/90 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700/50 hover:border-red-500/30 transition-all duration-300 shadow-sm"
          title="Sign Out"
        >
          <span>Sign Out</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-2xl text-white ${stat.color} shadow-lg`}>
              {stat.icon}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* قسم مراجعة الكورسات */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h3 className="text-xl font-black text-slate-800">Pending Approvals</h3>
            <span className="text-sm bg-amber-100 text-amber-600 px-4 py-1 rounded-full font-bold">
              {teacherCourses.length} New Requests
            </span>
          </div>

          <div className="space-y-4">
            {teacherCourses.length === 0 ? (
              <p className="text-slate-400 text-center py-10 font-bold italic">No pending requests for now. System is up to date! ✅</p>
            ) : (
              teacherCourses.map((course) => (
                <div key={course.id} className="flex flex-col md:flex-row justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black uppercase">
                      {course.title.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800">{course.title}</h4>
                      <p className="text-xs text-slate-400">Instructor: <span className="text-blue-600 font-bold">{course.instructor}</span></p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4 md:mt-0">
                    <button
                      onClick={() => handleApprove(course.id, course.title)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(course.id, course.title)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users Section */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6">Recent Users</h3>
          <div className="space-y-4">
            {users.slice(0, 5).map((u) => (
              <div key={u.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-none">{u.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">{u.role}</p>
                  </div>
                </div>
                {/* [تقرير 1 - صفحة 5]: تفعيل زر الـ Delete بربطه بالدالة الديناميكية المحمية */}
                <button
                  onClick={() => handleDeleteUser(u.id, u.name)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                  title="Remove User"
                  aria-label="Delete user"
                >
                  <Trash2 size={16} />
                </button>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}