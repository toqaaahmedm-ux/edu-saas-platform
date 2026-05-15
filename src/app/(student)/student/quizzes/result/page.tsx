"use client";
import { useQuizStore } from "@/store/useQuizStore";
import { useAuthStore } from "@/store/useAuthStore"; 
import { Certificate } from "@/components/student/Certificate";
import Link from "next/link";
import { Award, RefreshCcw, Home, Download } from "lucide-react";
import { useEffect, useState } from "react";

export default function ResultPage() {
  // [تقرير 1 - صفحة 1]: قفلت الحساب اليدوي.. بنجيب النتيجة جاهزة من الـ Store
  const score = useQuizStore((state) => state.score);
  const resetQuiz = useQuizStore((state) => state.resetQuiz);
  const user = useAuthStore((state) => state.user); 
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // الطالب ناجح لو جاب 50 أو أكتر (Fix Score Logic)
  const currentScore = score || 0;
  const isPassed = currentScore >= 50;

  return (
    <div className="w-full flex flex-col items-center py-10 px-4 text-left page-transition">
      
      {/* [تقرير 1 - صفحة 4]: شيلت الـ style jsx global عشان كان بيعمل Error (Fix NEW-12) */}
      {/* وبدله استخدمنا كلاسات Tailwind ونظام الطباعة بتاع المتصفح النضيف */}

      <div className="max-w-5xl w-full bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-blue-50 text-center print:shadow-none print:border-none">
        
        <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 print:hidden ${isPassed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
          <Award size={48} />
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2 print:hidden">
          {isPassed ? "Congratulations! 🎉" : "Hard Luck! Keep trying"}
        </h1>

        <p className="text-gray-500 text-xl mb-8 font-medium print:hidden">
          Your final score is <span className="text-blue-600 font-black text-4xl">{currentScore}%</span>
        </p>

        {isPassed ? (
          <div className="mb-10 space-y-6 animate-in fade-in slide-in-from-bottom-5">
            {/* كونتر الشهادة كدة خلصت منه الحمد الله ومظبط  */}
            <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200 print:bg-white print:border-none">
              <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest print:hidden">Official Certificate Preview</h3>
              <div className="flex justify-center overflow-hidden h-[300px] md:h-[450px] print:h-auto">
                <div className="scale-[0.45] md:scale-[0.65] lg:scale-[0.8] origin-top print:scale-100">
                  {/* [تقرير 2]: تمرير اسم الطالب الحقيقي من الـ AuthStore (Fix BUG-09) */}
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

        {/* أزرار التنقل - بتختفي وقت الطباعة عشان الشكل يبقى سينيور */}
        <div className="flex flex-wrap justify-center gap-4 border-t border-slate-100 pt-10 print:hidden">
          <Link 
            href="/student" 
            onClick={resetQuiz} 
            className="flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200"
          >
            <Home size={20} /> Dashboard
          </Link>
                <Link 
            href="/student/dashboard" 
            onClick={resetQuiz} 
            className="..."
          >
            <Home size={20} /> Dashboard
          </Link>

        </div>
      </div>
    </div>
  );
}
