"use client";

import { useQuizStore } from "@/store/useQuizStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Certificate } from "@/components/student/Certificate";
import Link from "next/link";
import { Award, RefreshCcw, Home, Download, History } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";

interface QuizResult {
  score: number;
  date: string;
  passed: boolean;
}

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  
  const scoreParam = searchParams.get("score");
  const score = scoreParam ? parseInt(scoreParam) : 0;
  const resetQuiz = useQuizStore((s) => s.resetQuiz);
  const user = useAuthStore((s) => s.user);

  const [isClient, setIsClient] = useState(false);
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [certSaved, setCertSaved] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);

  // courseId ممكن تييجي من الـ URL ?courseId=xxx
  const courseId = searchParams.get("courseId");

  useEffect(() => {
    setIsClient(true);

    const currentScore = score ?? 0;
    const isPassed = currentScore >= 50;

    // ── تاريخ النتائج في localStorage ─────────────────────────────
    const newResult: QuizResult = {
      score: currentScore,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
      passed: isPassed,
    };
    const saved = localStorage.getItem("quiz-history");
    const existing: QuizResult[] = saved ? JSON.parse(saved) : [];
    const updated = [newResult, ...existing].slice(0, 10);
    localStorage.setItem("quiz-history", JSON.stringify(updated));
    setHistory(updated);

    // ── حفظ الشهادة في الباك إند لو نجح ──────────────────────────
    if (isPassed && courseId) {
      apiClient
        apiClient.post("/certificates/my", { courseId })
        .then(() => setCertSaved(true))
        .catch((err) => {
          // لو الشهادة موجودة بالفعل مش مشكلة
          if (err?.response?.status === 409) {
            setCertSaved(true);
          } else {
            setCertError("Failed to save certificate");
            console.error("Certificate error:", err);
          }
        });
    }
  }, [score, courseId]);

  if (!isClient) return null;

  const currentScore = score ?? 0;
  const isPassed = currentScore >= 50;
  const bestScore = history.length > 0 ? Math.max(...history.map((r) => r.score)) : currentScore;
  const avgScore = history.length > 0
    ? Math.round(history.reduce((sum, r) => sum + r.score, 0) / history.length)
    : currentScore;

  return (
    <div className="w-full flex flex-col items-center py-10 px-4 text-left page-transition">
      <div className="max-w-5xl w-full space-y-6">

        {/* ── Result Card ── */}
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-blue-50 text-center print:shadow-none print:border-none">

          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 print:hidden ${isPassed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}>
            <Award size={48} />
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2 print:hidden">
            {isPassed ? "Congratulations! 🎉" : "Hard Luck! Keep trying"}
          </h1>

          <p className="text-gray-500 text-xl mb-8 font-medium print:hidden">
            Your final score is{" "}
            <span className="text-blue-600 font-black text-4xl">{currentScore}%</span>
          </p>

          {/* ── Stats ── */}
          <div className="grid grid-cols-3 gap-4 mb-8 print:hidden">
            <div className="bg-blue-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Current</p>
              <p className="text-3xl font-black text-blue-600">{currentScore}%</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Best</p>
              <p className="text-3xl font-black text-emerald-600">{bestScore}%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Average</p>
              <p className="text-3xl font-black text-purple-600">{avgScore}%</p>
            </div>
          </div>

          {/* ── Certificate ── */}
          {isPassed ? (
            <div className="mb-10 space-y-6 animate-in fade-in slide-in-from-bottom-5">
              {certSaved && (
                <p className="text-emerald-600 font-bold text-sm">
                  ✅ Certificate saved to your account
                </p>
              )}
              {certError && (
                <p className="text-red-400 font-bold text-sm">{certError}</p>
              )}
              <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200 print:bg-white print:border-none">
                <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest print:hidden">
                  Official Certificate Preview
                </h3>
                <div className="flex justify-center overflow-hidden h-[300px] md:h-[450px] print:h-auto">
                  <div className="scale-[0.45] md:scale-[0.65] lg:scale-[0.8] origin-top print:scale-100">
                    <Certificate name={user?.name || "Student Name"} score={currentScore} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 mx-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl active:scale-95 print:hidden"
              >
                <Download size={20} /> Save Certificate as PDF
              </button>
            </div>
          ) : (
            <div className="mb-10 p-6 bg-red-50 rounded-2xl border border-red-100 text-red-600 font-bold print:hidden">
              You need at least 50% to earn a certificate. Don't give up!
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex flex-wrap justify-center gap-4 border-t border-slate-100 pt-10 print:hidden">
            <button
              onClick={() => {
                resetQuiz();
                router.back();
              }}
              className="flex items-center gap-2 px-8 py-4 border-2 border-blue-100 text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all"
            >
              <RefreshCcw size={20} /> Retake Quiz
            </button>
            <Link
              href="/student/dashboard"
              onClick={resetQuiz}
              className="flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              <Home size={20} /> Back to Dashboard
            </Link>
          </div>
        </div>

        {/* ── History ── */}
        {history.length > 1 && (
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 print:hidden">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <History size={20} /> Result History
            </h2>
            <div className="space-y-3">
              {history.map((result, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${result.passed ? "bg-emerald-500" : "bg-red-400"}`} />
                    <span className="text-sm font-bold text-slate-600">{result.date}</span>
                    {i === 0 && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                        Latest
                      </span>
                    )}
                  </div>
                  <span className={`font-black text-lg ${result.passed ? "text-emerald-600" : "text-red-500"}`}>
                    {result.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}