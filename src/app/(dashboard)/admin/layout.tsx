"use client";
import ImpersonationBanner from "@/components/shared/ImpersonationBanner";
import Navbar from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

// NEW: admin had no layout.tsx at all, so it never got a sidebar — that's
// why "Academic Structure" (added to ADMIN_ROUTES earlier) never showed
// up anywhere. This mirrors TeacherLayout's structure exactly, but uses
// the shared Sidebar component (which already branches to ADMIN_ROUTES
// based on the logged-in user's role) instead of a role-specific one.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden text-left">
      <ImpersonationBanner />

      <div className="flex flex-1 min-h-0">
        <aside className="h-full w-72 flex-shrink-0 hidden md:block border-r border-slate-100">
          <Sidebar />
        </aside>

        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <header className="w-full bg-white/80 backdrop-blur-md border-b sticky top-0 z-30">
            <Navbar />
          </header>

          <main className="flex-1 overflow-y-auto bg-slate-50/40 p-6 md:p-10 scroll-smooth">
            <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}