// "use client";
import { LayoutDashboard, BookOpen, PenTool, Award, PlusCircle, Users, Settings, Building2, CreditCard, ShieldCheck, Receipt } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut } from 'lucide-react';
import { STUDENT_ROUTES, TEACHER_ROUTES, ADMIN_ROUTES } from '@/constants/routes';
import { useTenantBranding } from '@/hooks/useTenantBranding';
import { useTranslations } from 'next-intl';

export const Sidebar = () => {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { branding } = useTenantBranding();
  const t = useTranslations('sidebar');
  const tCommon = useTranslations('common');

  const getRoutes = () => {
    if (user?.role === 'ADMIN') return ADMIN_ROUTES || [];
    if (user?.role === 'TEACHER') return TEACHER_ROUTES;
    return STUDENT_ROUTES;
  };

  const routes = getRoutes();

  const handleLogout = () => {
    try {
      document.cookie = "user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
      logout();
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-storage");
        window.location.replace("/login");
      }
    } catch (error) {
      if (typeof window !== "undefined") {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
  };

  return (
    <aside className="w-64 bg-white border-r h-screen sticky top-0 p-6 hidden md:flex md:flex-col overflow-hidden">
      {/* logo */}
      <div className="flex items-center gap-3 mb-8 px-2 flex-shrink-0">
        <div
          className="text-2xl font-black tracking-tighter italic"
          style={{ color: branding.primaryColor }}
        >
          EduSaaS.
        </div>
        {branding.logoUrl && (
          <>
            <div className="w-px h-7 bg-slate-200" />
            <img
              src={branding.logoUrl}
              alt={branding.displayName}
              className="h-7 w-auto object-contain"
            />
          </>
        )}
      </div>

      {/* nav — no scroll, all items visible */}
      <nav className="flex-1 space-y-1">
        {routes && routes.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                isActive
                  ? "text-white shadow-lg"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              }`}
              style={isActive ? { backgroundColor: branding.primaryColor } : undefined}
            >
              <Icon size={18} className={isActive ? "text-white" : ""} />
              <span className="font-extrabold text-[13px]">{t(item.labelKey as any)}</span>
            </Link>
          );
        })}
      </nav>

      {/* footer */}
      <div className="flex-shrink-0 pt-3 space-y-2 border-t border-slate-100">
        <div className="px-3 py-2">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{tCommon('loggedInAs')}</p>
          <p className="text-xs font-bold text-slate-700 truncate">{user?.name || user?.email || "Guest User"}</p>
          <p className="text-[9px] font-bold text-blue-500 uppercase mt-1">{user?.role || "VISITOR"}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={18} />
          {tCommon('signOut')}
        </button>
      </div>
    </aside>
  );
};