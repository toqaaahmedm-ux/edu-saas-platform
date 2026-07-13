"use client";
import { SuperAdminSidebar } from "@/components/layout/SuperAdminSidebar";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <SuperAdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}