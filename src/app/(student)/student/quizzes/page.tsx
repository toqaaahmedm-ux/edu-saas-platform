"use client";
import { useQuizStore } from "@/store/useQuizStore";
import { QuizTimer } from "@/components/student/QuizTimer";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, FastForward, CheckCircle2 } from "lucide-react";
// [تقرير 1 - صفحة 2]: ندينا الأسئلة والإجابات الصح عشان نحسب الدرجة بجد (Fix NEW-03)
import { QUIZ_QUESTIONS, QUIZ_ANSWERS } from "@/data/quizzes.data";

export default function QuizPage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  const currentIndex = useQuizStore((state) => state.currentIndex);
  const isStarted = useQuizStore((state) => state.isStarted);
  const isFinished = useQuizStore((state) => state.isFinished);
  const answers = useQuizStore((state) => state.answers);
  const startQuiz = useQuizStore((state) => state.startQuiz);
  const setAnswer = useQuizStore((state) => state.setAnswer);
  const nextQuestion = useQuizStore((state) => state.nextQuestion);
  const prevQuestion = useQuizStore((state) => state.prevQuestion);
  const skipQuestion = useQuizStore((state) => state.skipQuestion);
  const completeQuiz = useQuizStore((state) => state.completeQuiz);

  useEffect(() => {
    setIsClient(true);
    if (isFinished) {
      router.push("/student/quizzes/result");
      return;
    }
    if (!isStarted && !isFinished) {
      startQuiz(30 * 60);
    }
  }, [isStarted, isFinished, startQuiz, router]);

  if (!isClient) return null;

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  // [تقرير 1 - صفحة 2]: هنا صلحنا مشكلة الـ 80% الثابتة والـ 0% الغلط
  // الحساب بقى حقيقي وبيعتمد على إجاباتك الفعلية (Fix Score Logic)
  if (!currentQ || isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4 animate-in fade-in zoom-in duration-500">
        <div className="text-center bg-white p-12 md:p-20 rounded-[3.5rem] shadow-2xl border border-blue-50 max-w-3xl w-full">
          <div className="mb-8 flex justify-center text-7xl animate-bounce">🥳</div>
          <h2 className="text-4xl md:text-6xl font-black text-blue-600 mb-6 tracking-tight">Quiz Completed!</h2>
          <button
            onClick={() => {
              // 1. بنبدأ عداد الإجابات الصح من صفر
              let correctCount = 0;
              
              // 2. بنقارن كل إجابة الطالب اختارها بالإجابة الصح اللي في السيستم
              Object.keys(answers).forEach((qId) => {
                if (answers[qId] === QUIZ_ANSWERS[qId as keyof typeof QUIZ_ANSWERS]) {
                  correctCount++;
                }
              });

              // 3. بنحسب النسبة المئوية الحقيقية (عدد الصح / إجمالي الأسئلة * 100)
              const finalScore = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);

              // 4. بنسلم النسبة الحقيقية للـ Store (Fix NEW-04 Security)
              completeQuiz(finalScore);
              router.push("/student/quizzes/result");
            }}
            className="px-14 py-4 bg-blue-600 text-white text-xl font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3 mx-auto"
          >
            View Result & Certificate <CheckCircle2 size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full flex flex-col items-center p-4 md:p-8 text-left">
      <div className="w-full max-w-6xl flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-row justify-between items-center w-full">
          <div>
            <p className="text-blue-600 font-bold text-xs md:text-sm mb-1 uppercase tracking-widest italic">Medical Assessment</p>
            <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter">
              Question {currentIndex + 1} <span className="text-gray-200 font-light">/</span> {QUIZ_QUESTIONS.length}
            </h2>
          </div>
          <QuizTimer />
        </div>

        <div className="bg-white p-8 md:p-14 rounded-[3rem] shadow-xl border border-gray-100 w-full min-h-[550px] flex flex-col">
          <h3 className="text-3xl md:text-5xl font-black text-slate-800 mb-14 leading-tight">{currentQ.question}</h3>

          <div className="flex flex-col gap-5 w-full flex-1">
            {currentQ.options.map((opt, i) => {
              const isSelected = answers[currentQ.id] === i.toString();
              return (
                <button
                  key={i}
                  onClick={() => setAnswer(currentQ.id, i.toString())}
                  className={`flex items-center justify-between p-6 md:p-8 rounded-[2rem] border-2 transition-all duration-300 group ${
                    isSelected ? "border-blue-600 bg-blue-50/50 shadow-md scale-[1.01]" : "border-gray-100 bg-white hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <span className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-black text-xl md:text-3xl border-2 ${
                      isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-400 border-gray-100"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={`text-xl md:text-3xl font-bold ${isSelected ? "text-blue-900" : "text-slate-600"}`}>{opt}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="text-blue-600" size={32} />}
                </button>
              );
            })}
          </div>

          <div className="mt-16 pt-10 border-t border-gray-100 flex items-center justify-between w-full">
            <button
              disabled={currentIndex === 0}
              onClick={prevQuestion}
              className="flex items-center gap-2 px-8 py-4 font-bold text-gray-400 hover:text-slate-800 disabled:opacity-20 transition-all text-xl"
            >
              <ChevronLeft size={24} /> Previous
            </button>

            <div className="flex gap-4">
              <button
                onClick={skipQuestion}
                className="flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-orange-100 text-orange-600 font-bold hover:bg-orange-50 transition-all text-xl"
              >
                Skip <FastForward size={24} />
              </button>
              <button
                onClick={nextQuestion}
                className="flex items-center gap-2 px-14 py-4 rounded-2xl bg-blue-600 text-white font-black shadow-xl hover:bg-blue-700 active:scale-95 transition-all text-xl"
              >
                {currentIndex === QUIZ_QUESTIONS.length - 1 ? "Finish Quiz" : "Next"}
                {currentIndex === QUIZ_QUESTIONS.length - 1 ? <CheckCircle2 size={24} /> : <ChevronRight size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
