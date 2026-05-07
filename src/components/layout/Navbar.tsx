"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Bell, Search, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  
  // TC-05: حل مشكلة الـ Hydration Error لضمان استقرار الـ Build
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  // حماية الـ Build من أخطاء الـ Node.js والـ SSR
  if (!isMounted) return <div className="h-20 bg-white border-b" />;

  return (
    <nav className="h-20 bg-white/90 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50 border-b border-slate-50">
      
      {/* 1. نظام البحث الذكي (SaaS Logic) */}
      <div className="hidden md:flex items-center bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 w-96 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <Search className="text-slate-300" size={18} />
        <input 
          type="text" 
          aria-label="Search courses" // حل مشكلة الـ Accessibility
          placeholder="Search courses or tutors..." 
          className="bg-transparent border-none outline-none pl-3 text-sm font-bold text-slate-600 placeholder:text-slate-300 w-full"
        />
      </div>

      {/* 2. منطقة المستخدم (Dynamic User Area - BUG-13) */}
      <div className="flex items-center gap-6">
        {/* Notifications Icon - تم إضافة الـ Label لإزالة الخطأ في VS Code */}
        <button 
          type="button"
          aria-label="Notifications" 
          className="relative p-2 text-slate-400 hover:text-blue-600 transition-all hover:scale-110"
        >
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>

        {/* Profile Info */}
        <div className="flex items-center gap-4 border-l pl-6 border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-800 leading-none">
              {user?.name || "Guest User"}
            </p>
            <p className="text-[10px] font-black text-emerald-500 uppercase mt-1.5 tracking-widest">
              Online • {user?.role || "Visitor"}
            </p>
          </div>
          
          {/* Avatar Dropdown */}
          <div className="relative group">
            <button
              type="button"
              aria-label="User menu"
              className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-slate-200 cursor-pointer group-hover:rotate-6 transition-transform"
            >
              {user?.name?.charAt(0) || <User size={20} />}
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all p-2 pointer-events-none group-hover:pointer-events-auto">
              <div className="p-3 border-b border-slate-50 mb-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Account Management</p>
              </div>
              
              <button 
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 text-red-500 font-black text-xs hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut size={16} />
                SIGN OUT
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
