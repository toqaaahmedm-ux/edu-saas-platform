"use client";

import { ShieldCheck, Users, CreditCard, LayoutGrid, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { USERS_DATA } from "@/data/users.data";
import { COURSES } from "@/data/courses.data";
import { useAuthStore } from "@/store/useAuthStore"; // استدعاء الـ Store لجلب بيانات الأدمن

export default function AdminDashboard() {
  const [isClient, setIsClient] = useState(false);
  const user = useAuthStore((state) => state.user); // جلب بيانات الأدمن الحقيقية

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // حساب الإحصائيات بناءً على ملفات الداتا المركزية (Centralized Data)
  const totalStudents = USERS_DATA.filter(u => u.role === 'STUDENT').length;
  
  const stats = [
    { label: "Total Revenue", value: "EGP 124,500", icon: <CreditCard />, color: "bg-emerald-600" },
    { label: "Total Students", value: totalStudents, icon: <Users />, color: "bg-blue-600" },
    { label: "Total Courses", value: COURSES.length, icon: <LayoutGrid />, color: "bg-amber-500" },
    { label: "System Health", value: "100%", icon: <ShieldCheck />, color: "bg-slate-700" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 text-left">
      
      {/* هيدر الأدمن - تم ربطه بالـ Store عشان يعرض اسم الشخص اللي سجل دخول فعلاً */}
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2">Central Admin Panel 🔐</h2>
          <p className="text-slate-400 font-medium text-lg italic">
            Welcome back, {user?.name || "Admin"}. Monitoring {USERS_DATA.length} active members.
          </p>
        </div>
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* كروت الإحصائيات - بقت دايناميك مش مجرد أرقام مكتوبة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group">
            <div className={`p-4 rounded-2xl text-white ${stat.color} shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
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
        {/* قسم مراجعة الكورسات الجديدة (Pending Approvals) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h3 className="text-xl font-black text-slate-800">Pending Approvals</h3>
            <span className="text-sm bg-amber-100 text-amber-600 px-4 py-1 rounded-full font-bold">New Requests</span>
          </div>
          
          <div className="space-y-4">
            {COURSES.slice(0, 2).map((course) => (
              <div key={course.id} className="flex flex-col md:flex-row justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold uppercase">
                    {course.title.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800">{course.title}</h4>
                    <p className="text-xs text-slate-400">Instructor: <span className="text-blue-600 font-bold">{course.instructor}</span></p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                  <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm">
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* إدارة اليوزرز الجدد (Quick User Management) */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6">Recent Users</h3>
          <div className="space-y-4">
            {USERS_DATA.slice(0, 5).map((user) => (
              <div key={user.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-all border-b border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{user.role}</p>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-red-500 transition-colors p-1" title="Remove User">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs font-bold hover:border-blue-200 hover:text-blue-600 transition-all">
            View System Directory
          </button>
        </div>
      </div>
    </div>
  );
}
