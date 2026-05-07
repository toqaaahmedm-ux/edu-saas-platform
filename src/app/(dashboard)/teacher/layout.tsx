"use client";

import Navbar from "@/components/layout/Navbar";
import { TeacherSidebar } from "./TeacherSidebar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden text-left">
      
      {/* 1. Teacher Sidebar - Fixed on the left (Architecture Fix) */}
      <aside className="h-full w-72 flex-shrink-0 hidden md:block border-r border-slate-100">
        <TeacherSidebar />
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Navbar - Sticky for better accessibility (Fixed per Audit) */}
        <header className="w-full bg-white/80 backdrop-blur-md border-b sticky top-0 z-30">
          <Navbar />
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/40 p-6 md:p-10 scroll-smooth">
          <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
