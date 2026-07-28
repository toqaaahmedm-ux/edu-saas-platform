"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, Shield } from 'lucide-react';
import { SUPERADMIN_ROUTES } from '@/constants/routes';
import { useTranslations } from 'next-intl';

// Sprint 1 fix: SuperAdmin layout previously had no sidebar/navigation at
// all, only a header. This is a separate component (not a role branch
// inside the shared Sidebar) because SuperAdmin pages already use a dark
// theme (bg-slate-950, purple accents — see AuditLogsPage), which would
// clash visually with the shared Sidebar's light theme.
export const SuperAdminSidebar = () => {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const t = useTranslations("sidebar");
  const tc = useTranslations("common");

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 p-6 hidden md:flex md:flex-col">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <Shield size={18} />
        </div>
        <div>
          <h1 className="font-black text-white text-sm">SuperAdmin</h1>
          <p className="text-[10px] text-slate-400">EduSaaS Platform</p>
        </div>
      </div>
      <nav className="flex-1 space-y-2">
        {SUPERADMIN_ROUTES.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <div className="px-3">
          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{tc("loggedInAs")}</p>
          <p className="text-xs font-bold text-slate-200 truncate">{user?.name || user?.email || "Guest User"}</p>
          <p className="text-[9px] font-bold text-purple-400 uppercase mt-1">{user?.role || "VISITOR"}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 font-bold text-sm hover:bg-red-950/30 rounded-xl transition-colors"
        >
          <LogOut size={18} />
          {tc("signOut")}
        </button>
      </div>
    </aside>
  );
};
