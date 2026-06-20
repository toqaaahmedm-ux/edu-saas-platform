"use client";
import { useAuthStore } from "@/store/useAuthStore";
import { Shield, LogOut } from "lucide-react";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Shield size={18} />
          </div>
          <div>
            <h1 className="font-black text-white">SuperAdmin Panel</h1>
            <p className="text-xs text-slate-400">EduSaaS Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-bold transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </header>
      <main className="p-8">{children}</main>
    </div>
  );
}