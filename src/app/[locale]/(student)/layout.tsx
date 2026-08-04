"use client";
import Navbar from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/*
          The sidebar is rendered directly here since we already set
          up the aside styling and fixed width for it in the previous step
      */}
      <Sidebar />
      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Header */}
        <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20">
          <Navbar />
        </header>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#F9FAFB] p-4 md:p-8">
          {/* Really like this animation as a technique — it gives a more professional feel when navigating */}
          <div className="w-full max-w-none mx-0 animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
