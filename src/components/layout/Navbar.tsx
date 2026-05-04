"use client";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";

const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const [isClient, setIsClient] = useState(false);

  // لضمان عدم حدوث خطأ في الهيدريشن (لأن الداتا جاية من الـ LocalStorage)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // الاسم الافتراضي لو مفيش مستخدم (لحماية الكود)
  const displayName = user?.name || "Guest User";
  const displayRole = user?.role || "Student";

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white border-b border-slate-50">
      {/* اسم المنصة */}
      <div className="text-2xl font-black text-blue-600 tracking-tight">
        EduSaaS
      </div>

      {/* بيانات المستخدم الديناميكية */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col text-right"> {/* خليتها يمين عشان العربي أو التنسيق */}
          <span className="text-sm font-bold text-gray-800">
            {isClient ? displayName : "Loading..."}
          </span>
          <span className="text-xs text-green-500 font-medium">
            Online • {isClient ? displayRole : ""}
          </span>
        </div>
        
        {/* الصورة الشخصية أو الحرف الأول من الاسم */}
        <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-xl shadow-sm border border-blue-50 font-bold text-blue-600">
           {isClient && user?.name ? user.name.charAt(0) : "👤"}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
