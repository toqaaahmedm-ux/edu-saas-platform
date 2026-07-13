"use client";
import { LayoutDashboard, BookOpen, PenTool, Award, PlusCircle, Users, Settings, Building2, CreditCard, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut } from 'lucide-react'; 
import { STUDENT_ROUTES, TEACHER_ROUTES, ADMIN_ROUTES } from '@/constants/routes';

export const Sidebar = () => {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const getRoutes = () => {
    if (user?.role === 'ADMIN') return ADMIN_ROUTES || [];
    if (user?.role === 'TEACHER') return TEACHER_ROUTES;
    return STUDENT_ROUTES;
  };

  const routes = getRoutes();

  // [تقرير 1 - صفحة 5]: تحديث دالة الخروج الآمن لتنظيف الكاش والـ Stores تماماً (Fix UI-03 & BUG-09)
  const handleLogout = () => {
    try {
      // 1. مسح كوكيز الصلاحيات تماماً
      document.cookie = "user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
      
      // 2. تصفية الـ Zustand Store
      logout(); 
      
      // 3. تنظيف الـ LocalStorage احتياطياً لضمان خروج الـ Guest
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-storage");
        // التوجيه الفوري لصفحة التسجيل أو اللوجن
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
    <aside className="w-72 bg-white border-r h-screen sticky top-0 p-8 hidden md:block">
      <div className="text-3xl font-black mb-12 text-blue-600 px-2 tracking-tighter italic">
        EduSaaS.
      </div>
      
      <nav className="space-y-3">
        {routes && routes.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center p-4 rounded-[1.2rem] transition-all duration-300 group ${
                isActive 
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-100 translate-x-2" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-blue-600"
              }`}
            >
              <Icon size={22} className={`mr-4 transition-colors ${isActive ? "text-white" : "text-slate-300 group-hover:text-blue-600"}`} />
              <span className="font-extrabold text-[15px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* منطقة بيانات المستخدم وزر الخروج */}
      <div className="absolute bottom-10 left-8 right-8 space-y-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Logged in as</p>
          <p className="text-xs font-bold text-slate-700 truncate">{user?.name || user?.email || "Guest User"}</p>
          <p className="text-[9px] font-bold text-blue-500 uppercase mt-1">{user?.role || "VISITOR"}</p>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 text-red-500 font-black hover:bg-red-50 rounded-2xl transition-all group"
        >
          <span className="text-sm">Sign Out</span>
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </aside>
  );
};
// Sprint 1 fix: SuperAdmin sidebar was empty — no nav links existed at all.
export const SUPERADMIN_ROUTES = [
  {
    label: 'Dashboard',
    href: '/superadmin',
    icon: LayoutDashboard,
  },
  {
    label: 'Tenants',
    href: '/superadmin/tenants',
    icon: Building2,
  },
  {
    label: 'Plans & Billing',
    href: '/superadmin/plans',
    icon: CreditCard,
  },
  {
    label: 'Audit Logs',
    href: '/superadmin/audit-logs',
    icon: ShieldCheck,
  },
];