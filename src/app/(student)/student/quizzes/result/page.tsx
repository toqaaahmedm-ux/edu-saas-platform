"use client";
import { useQuizStore } from "@/store/useQuizStore";
import { useAuthStore } from "@/store/useAuthStore"; // استيراد الـ Auth Store
import { Certificate } from "@/components/student/Certificate";
import Link from "next/link";
import { Award, RefreshCcw, Home, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { QUIZ_QUESTIONS } from "@/constants/mockData";

export default function ResultPage() {
  const { calculateScore, resetQuiz } = useQuizStore();
  const user = useAuthStore((state) => state.user); // سحب بيانات المستخدم الحقيقي
  const [score, setScore] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const finalScore = calculateScore(QUIZ_QUESTIONS);
    setScore(finalScore);
  }, [calculateScore]);

  if (!isClient) return null;

  const isPassed = score >= 50;

  return (
    <div className="w-full flex flex-col items-center py-10 px-4 text-left page-transition">
      {/* CSS الخاص بالطباعة (حل BUG-08) */}
      <style jsx global>{`
        @media print {
          nav, aside, button, a, .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
          .certificate-container {
            transform: scale(1) !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="max-w-5xl w-full bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-blue-50 text-center no-print">
        <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 ${isPassed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
          <Award size={48} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
          {isPassed ? "Congratulations! 🎉" : "Hard Luck! Keep trying"}
        </h1>
        <p className="text-gray-500 text-xl mb-8 font-medium">
          Your final score is <span className="text-blue-600 font-black text-4xl">{score}%</span>
        </p>

        {isPassed ? (
          <div className="mb-10 space-y-6 animate-in fade-in slide-in-from-bottom-5">
            <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200 certificate-container">
              <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest no-print">Official Certificate Preview</h3>
              <div className="flex justify-center overflow-hidden h-[300px] md:h-[450px]">
                <div className="scale-[0.45] md:scale-[0.65] lg:scale-[0.8] origin-top">
                  {/* BUG-09: تمرير اسم الطالب الحقيقي من الـ AuthStore */}
                  <Certificate name={user?.name || "Student Name"} score={score} />
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => window.print()} 
              className="flex items-center gap-2 mx-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl active:scale-95 no-print"
            >
              <Download size={20} /> Save Certificate as PDF
            </button>
          </div>
        ) : (
          <div className="mb-10 p-6 bg-red-50 rounded-2xl border border-red-100 text-red-600 font-bold">
            You need at least 50% to earn a certificate. Don't give up!
          </div>
        )}

        {/* أزرار التنقل (مخفية في الطباعة) */}
        <div className="flex flex-wrap justify-center gap-4 border-t border-slate-100 pt-10 no-print">
          <Link href="/student/dashboard" onClick={resetQuiz} className="flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200">
            <Home size={20} /> Dashboard
          </Link>
          <Link href="/student/quizzes" onClick={resetQuiz} className="flex items-center gap-2 px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-2xl font-bold hover:bg-blue-50">
            <RefreshCcw size={20} /> Retake Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}
