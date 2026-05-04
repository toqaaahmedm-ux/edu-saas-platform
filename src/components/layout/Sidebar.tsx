"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore'; // عشان نعرف الـ Role
import { STUDENT_ROUTES, TEACHER_ROUTES } from '@/constants/routes';

export const Sidebar = () => {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  
  // تحديد الروابط بناءً على دور المستخدم
  const routes = user?.role === 'TEACHER' ? TEACHER_ROUTES : STUDENT_ROUTES;

  return (
    <aside className="w-64 bg-white border-r h-screen sticky top-0 p-6 hidden md:block">
      <div className="text-2xl font-black mb-10 text-blue-600 px-2 tracking-tight">
        EduSaaS
      </div>
      
      <nav className="space-y-2">
        {routes.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center p-3.5 rounded-2xl transition-all duration-200 group ${
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                  : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <Icon size={22} className={`mr-3 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`} />
              <span className="font-bold text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
