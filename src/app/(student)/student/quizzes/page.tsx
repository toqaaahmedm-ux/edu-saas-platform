"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { FileQuestion, Search, Clock, Loader2, ChevronRight } from "lucide-react";
import { apiClient } from "@/lib/api/client";

interface Quiz {
  id: string;
  title: string;
  timeLimit: number;
  courseId: string;
  course: { title: string };
  questions: { id: string }[];
}

export default function QuizzesListPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    apiClient.get("/quiz")
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setQuizzes(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = quizzes.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m} min`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left pb-10 w-full max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-blue-50">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Quizzes</h2>
          <p className="text-slate-500 font-medium italic">اختبر معلوماتك واحصل على شهادتك</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            type="text"
            placeholder="Search quizzes..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none transition-all font-bold text-sm placeholder:text-slate-300"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-400 font-black tracking-widest uppercase text-xs">Loading Quizzes...</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Quizzes Found"
          description="No quizzes available yet."
          icon={FileQuestion}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filtered.map((quiz) => (
            <div
              key={quiz.id}
              onClick={() => router.push(`/student/quizzes/${quiz.id}`)}
              className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-400 w-full" />
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  {quiz.course?.title && (
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-4 inline-block">
                      {quiz.course.title}
                    </span>
                  )}
                  <h3 className="text-xl font-black text-slate-800 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                    {quiz.title}
                  </h3>
                  <div className="flex items-center gap-4 text-slate-400">
                    <span className="flex items-center gap-1.5 text-xs font-bold">
                      <FileQuestion size={14} />
                      {quiz.questions?.length ?? "?"} Questions
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold">
                      <Clock size={14} />
                      {fmt(quiz.timeLimit)}
                    </span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Start Quiz
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white group-hover:bg-blue-700 transition-colors shadow-lg">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}