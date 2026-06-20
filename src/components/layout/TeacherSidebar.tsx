"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, PlusCircle, Users, BarChart3, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore"; // استدعاء الـ Store لعمل Logout
import { toast } from "sonner"; // إضافة تنبيه عند الخروج

export function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout); // جلب دالة الخروج

const handleLogout = async () => {
  await logout(); //  بيكلم /api/auth/logout ويمسح الـ httpOnly cookie
    document.cookie = "user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-storage");
      window.location.replace("/");
    }
  };
  const menuItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/teacher" },
    { label: "My Courses", icon: <BookOpen size={20} />, href: "/teacher/courses" },
    { label: "New Course", icon: <PlusCircle size={20} />, href: "/teacher/courses/new" },
    { label: "Students", icon: <Users size={20} />, href: "/teacher/students" },
    { label: "Analytics", icon: <BarChart3 size={20} />, href: "/teacher/analytics" },
    { label: "Settings", icon: <Settings size={20} />, href: "/teacher/settings" },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-100">
      
      {/* Sidebar Branding - Clean & Bold */}
      <div className="p-8">
        <h1 className="text-2xl font-black text-blue-600 tracking-tight">
          Teacher<span className="text-slate-800 font-black">Hub</span>
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Medical Faculty</p>
      </div>

      {/* Main Navigation - Logic for Active States */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 ${
                isActive 
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-100 translate-x-1" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
              }`}
            >
              <span className={`${isActive ? "scale-110" : "group-hover:scale-110"} transition-transform`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout Action - Functional & Dynamic */}
      <div className="p-4 mt-auto border-t border-slate-50">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
