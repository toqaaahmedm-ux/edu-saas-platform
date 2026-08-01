
"use client";
import { Link, usePathname } from "@/i18n/navigation";
import { LayoutDashboard, BookOpen, PlusCircle, Users, BarChart3, Settings, LogOut, HelpCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useTranslations } from "next-intl";

export function TeacherSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { branding } = useTenantBranding();
  const t = useTranslations("sidebar");
  const tCommon = useTranslations("common");

  const handleLogout = async () => {
    await logout();
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
    { label: t("quizzes"), icon: <HelpCircle size={20} />, href: "/teacher/quizzes" },
    { label: t("students"), icon: <Users size={20} />, href: "/teacher/students" },
    { label: t("analytics"), icon: <BarChart3 size={20} />, href: "/teacher/analytics" },
    { label: t("settings"), icon: <Settings size={20} />, href: "/teacher/settings" },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-100 overflow-hidden">
      {/* branding */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1
            className="text-2xl font-black tracking-tighter italic"
            style={{ color: branding.primaryColor }}
          >
            {branding.displayName || "EduSaaS"}
          </h1>
          {branding.logoUrl && (
            <img
              src={branding.logoUrl}
              alt={branding.displayName}
              className="h-7 w-auto object-contain"
            />
          )}
        </div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t("teacherPanel")}</p>
      </div>

      {/* nav */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                isActive
                  ? "text-white shadow-lg"
                  : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
              }`}
              style={isActive ? { backgroundColor: branding.primaryColor } : undefined}
            >
              <span className={isActive ? "text-white" : "text-slate-400"}>
                {item.icon}
              </span>
              <span className="text-[14.5px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* footer */}
      <div className="px-4 pb-4 pt-3 space-y-2 border-t border-slate-100 flex-shrink-0">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{tCommon('loggedInAs')}</p>
          <p className="text-sm font-bold text-slate-700 truncate">{user?.name || user?.email || "Guest User"}</p>
          <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">{user?.role || "VISITOR"}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          {tCommon("signOut")}
        </button>
      </div>
    </div>
  );
}
