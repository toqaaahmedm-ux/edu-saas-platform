"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Bell, Search, LogOut, User, Check, CheckCheck, Languages } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from "@/services/notifications.service";

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isMounted, setIsMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  // NEW: language toggle — swaps between en/ar while staying on the
  // same page, using next-intl's locale-aware router/pathname.
  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  if (!isMounted) return <div className="h-20 bg-white border-b" />;

  return (
    <nav className="h-20 bg-white/90 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50 border-b border-slate-50">

      {/* Search */}
      <div className="hidden md:flex items-center bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 w-96 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <Search className="text-slate-300" size={18} />
        <input
          type="text"
          aria-label="Search courses"
          placeholder="Search courses or tutors..."
          className="bg-transparent border-none outline-none pl-3 text-sm font-bold text-slate-600 placeholder:text-slate-300 w-full"
        />
      </div>

      <div className="flex items-center gap-6">

        {/* NEW: Language toggle */}
        <button
          type="button"
          onClick={toggleLanguage}
          aria-label="Toggle language"
          className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-black text-xs"
        >
          <Languages size={18} />
          {locale === "en" ? "عربي" : "English"}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-blue-600 transition-all hover:scale-110"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-80 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl z-50">
              <div className="flex items-center justify-between p-4 border-b border-slate-50">
                <h3 className="text-sm font-black text-slate-800">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm font-bold py-8">No notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.isRead && markAsRead(notif.id)}
                      className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-all ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-black text-slate-800">{notif.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                          <p className="text-[10px] text-slate-300 mt-1">
                            {new Date(notif.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-4 border-l pl-6 border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-800 leading-none">
              {user?.name || "Guest User"}
            </p>
            <p className="text-[10px] font-black text-emerald-500 uppercase mt-1.5 tracking-widest">
              Online • {user?.role || "Visitor"}
            </p>
          </div>

          <div className="relative group">
            <button
              type="button"
              aria-label="User menu"
              className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-slate-200 cursor-pointer group-hover:rotate-6 transition-transform"
            >
              {user?.name?.charAt(0) || <User size={20} />}
            </button>

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
