"use client";

import { Search, Mail, ExternalLink, TrendingUp } from "lucide-react";
import { useState } from "react";
import { USERS_DATA } from "@/data/users.data"; // ربط البيانات المركزية (SaaS Standard)

export default function StudentReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // فلترة الطلاب بناءً على البحث (UX Logic)
  const studentsList = [
    { id: 1, name: "Tuqa Mohamed", email: "taqaa@mail.com", progress: 95, lastQuiz: 98, status: "Active", progressWidth: "w-[95%]" },
    { id: 2, name: "Mohamed Hafez", email: "hafez@mail.com", progress: 45, lastQuiz: 60, status: "Absent", progressWidth: "w-[45%]" },
    { id: 3, name: "Sara Mahmoud", email: "sara@mail.com", progress: 80, lastQuiz: 85, status: "Active", progressWidth: "w-[80%]" },
  ].filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left pb-10">
      
      {/* Search Header - Designed for Teacher UX */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Student Tracking</h2>
          <p className="text-slate-500 font-medium italic">Monitor academic progress and quiz performance.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Search by student name..." 
            className="w-full p-4 pl-12 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold placeholder:text-slate-300"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Reports Table - Architecture Fix (Clean Table Structure) */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em]">
                <th className="p-8 font-black">Student Info</th>
                <th className="p-8 font-black">Course Progress</th>
                <th className="p-8 font-black text-center">Latest Result</th>
                <th className="p-8 font-black">Status</th>
                <th className="p-8 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {studentsList.map((student) => (
                <tr key={student.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-blue-200">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-lg leading-tight">{student.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <Mail size={12} className="text-blue-400" /> {student.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-8">
                    <div className="flex items-center gap-4 min-w-[150px]">
                      <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className={`bg-blue-600 h-full transition-all duration-1000 ${student.progressWidth}`}></div>
                      </div>
                      <span className="font-black text-slate-700 text-sm">{student.progress}%</span>
                    </div>
                  </td>

                  <td className="p-8">
                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-xl">
                      <TrendingUp size={20} />
                      {student.lastQuiz}%
                    </div>
                  </td>

                  <td className="p-8">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm ${
                      student.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {student.status}
                    </span>
                  </td>

                  <td className="p-8 text-right">
                    <button 
                      aria-label="View Detailed Report"
                      className="p-3 bg-white border border-slate-100 text-slate-300 rounded-xl hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all"
                    >
                      <ExternalLink size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
