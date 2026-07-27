"use client";
import { Link, usePathname } from "@/i18n/navigation";
import { LayoutDashboard, BookOpen, PlusCircle, Users, BarChart3, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore"; // استدعاء الـ Store لعمل Logout
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useTranslations } from "next-intl";

export function TeacherSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const { branding } = useTenantBranding();
  const t = useTranslations("sidebar");
  const tCommon = useTranslations("common");

  const handleLogout = async () => {
    await logout(); //  بيكلم /api/auth/logout ويمسح الـ httpOnly cookie
    document.cookie = "user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-storage");
      window.location.replace("/");
    }
  };

  const menuItems = [
    { label: t("dashboard"), icon: <LayoutDashboard size={20} />, href: "/teacher" },
    { label: t("myCourses"), icon: <BookOpen size={20} />, href: "/teacher/courses" },
    { label: t("addCourse"), icon: <PlusCircle size={20} />, href: "/teacher/courses/new" },
    { label: t("students"), icon: <Users size={20} />, href: "/teacher/students" },
    { label: t("analytics"), icon: <BarChart3 size={20} />, href: "/teacher/analytics" },
    { label: t("settings"), icon: <Settings size={20} />, href: "/teacher/settings" },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-100">

      {/* Sidebar Branding - Dynamic per tenant */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <h1
            className="text-3xl font-black tracking-tighter italic"
            style={{ color: branding.primaryColor }}
          >
            {branding.displayName || "EduSaaS"}
          </h1>
          {branding.logoUrl && (
            <img
              src={branding.logoUrl}
              alt={branding.displayName}
              className="h-8 w-auto object-contain"
            />
          )}
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t("teacherPanel")}</p>
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
          <span>{tCommon("signOut")}</span>
        </button>
      </div>
    </div>
  );
}
