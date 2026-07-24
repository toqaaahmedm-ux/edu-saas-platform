"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Loader2, ArrowLeft, Mail, BookOpen, Award, TrendingUp } from "lucide-react";

export default function StudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: student, isLoading } = useQuery({
    queryKey: ["student-detail", id],
    queryFn: async () => {
      // fetch all enrollments and find this student's data
      const res = await apiClient.get(`/courses/teacher/students`);
      const enrollments = res.data?.data ?? [];
      const match = enrollments.find((e: any) => e.student?.id === id);
      return match ?? null;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <p className="text-slate-400 font-black text-xl">Student not found.</p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 font-black flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const s = {
    name: student.student?.name || "Unknown",
    email: student.student?.email || "",
    course: student.course?.title || "",
    progress: student.progress || 0,
    status: student.status || "ACTIVE",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()} title="Go back"
          className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all"
        >
          <ArrowLeft size={20} className="text-slate-500" />
        </button>
        <div>
          <h2 className="text-3xl font-black text-slate-800">Student Report</h2>
          <p className="text-slate-400 font-medium">Detailed view for {s.name}</p>
        </div>
      </div>

      {/* Student Card */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
        <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-200">
          {s.name.charAt(0)}
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-800">{s.name}</h3>
          <p className="text-slate-400 flex items-center gap-2 mt-1">
            <Mail size={14} /> {s.email}
          </p>
          <span className={`mt-2 inline-block px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
            s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
          }`}>
            {s.status}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Enrolled Course", value: s.course, icon: <BookOpen />, color: "bg-blue-600" },
          { label: "Progress", value: `${s.progress}%`, icon: <TrendingUp />, color: "bg-purple-600" },
          { label: "Status", value: s.status, icon: <Award />, color: "bg-emerald-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className={`p-4 rounded-2xl text-white ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="font-black text-slate-800 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h4 className="font-black text-slate-800 mb-4">Course Progress</h4>
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-1000 rounded-full"
            style={{ width: `${s.progress}%` }}
          />
        </div>
        <p className="text-slate-400 font-bold text-sm mt-2">{s.progress}% Complete</p>
      </div>

    </div>
  );
}