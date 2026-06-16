// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { ChevronLeft, ChevronRight, FastForward, CheckCircle2 } from "lucide-react";
// import { useQuiz, useStartQuiz, useSubmitQuiz } from "@/hooks/useQuizzes";
// import { useQuizStore } from "@/store/useQuizStore";
// import { QuizTimer } from "@/components/student/QuizTimer";

// export default function QuizPage() {
//   const router = useRouter();
//   const { id: quizId } = useParams<{ id: string }>();
//   const [attemptId, setAttemptId] = useState<string | null>(null);

//   const currentIndex = useQuizStore((s) => s.currentIndex);
//   const isStarted = useQuizStore((s) => s.isStarted);
//   const isFinished = useQuizStore((s) => s.isFinished);
//   const answers = useQuizStore((s) => s.answers);
//   const startQuiz = useQuizStore((s) => s.startQuiz);
//   const setAnswer = useQuizStore((s) => s.setAnswer);
//   const nextQuestion = useQuizStore((s) => s.nextQuestion);
//   const prevQuestion = useQuizStore((s) => s.prevQuestion);
//   const skipQuestion = useQuizStore((s) => s.skipQuestion);
//   const resetQuiz = useQuizStore((s) => s.resetQuiz);

//   const { data: quiz, isLoading } = useQuiz(quizId);
//   const startQuizMutation = useStartQuiz();
//   const submitQuizMutation = useSubmitQuiz();

//   const handleSubmit = () => {
//     const numericAnswers: Record<string, number> = {};
//     Object.entries(answers).forEach(([qId, val]) => {
//       numericAnswers[qId] = parseInt(val, 10);
//     });

//     submitQuizMutation.mutate(
//       { quizId, attemptId: attemptId ?? "", answers: numericAnswers },
//       {
//         onSuccess: (data) => {
//           router.push(`/student/quizzes/result?courseId=${quiz?.courseId}&score=${data.score}`);
//         },
//         onError: (err) => {
//           console.error("❌ err:", err);
//         },
//       }
//     );
//   };

//   useEffect(() => {
//     if (!quiz || isStarted) return;
//     resetQuiz();
//     startQuizMutation.mutate(quizId, {
//       onSuccess: (data) => {
//         setAttemptId(data.attemptId);
//         startQuiz(quiz.timeLimit ?? 600);
//       },
//       onError: (err) => console.error("Failed to start quiz:", err),
//     });
//   }, [quiz, isStarted]);

//   if (isLoading || startQuizMutation.isPending) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
//         <p className="text-slate-400 font-black tracking-widest uppercase text-xs animate-pulse">
//           Loading Assessment...
//         </p>
//       </div>
//     );
//   }

//   if (!quiz) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
//         <p className="text-red-400 font-bold">Quiz not found</p>
//         <button onClick={() => router.back()} className="mt-4 px-6 py-2 bg-slate-100 rounded-xl text-slate-600 font-bold">
//           ← Back
//         </button>
//       </div>
//     );
//   }

//   const questions = quiz.questions ?? [];
//   const currentQ = questions[currentIndex];
//   const isLast = currentIndex === questions.length - 1;

//   if (isFinished) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4 animate-in fade-in zoom-in duration-500">
//         <div className="text-center bg-white p-12 md:p-20 rounded-[3.5rem] shadow-2xl border border-blue-50 max-w-3xl w-full">
//           <div className="mb-8 flex justify-center text-7xl animate-bounce">🥳</div>
//           <h2 className="text-4xl md:text-6xl font-black text-blue-600 mb-6 tracking-tight">
//             Quiz Completed!
//           </h2>
//           <button
//             disabled={submitQuizMutation.isPending}
//             onClick={handleSubmit}
//             className="px-14 py-4 bg-blue-600 text-white text-xl font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3 mx-auto disabled:opacity-50"
//           >
//             {submitQuizMutation.isPending ? "Calculating Score..." : "View Result & Certificate"}
//             {!submitQuizMutation.isPending && <CheckCircle2 size={24} />}
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!currentQ) return null;

//   return (
//     <div className="w-full min-h-full flex flex-col items-center p-4 md:p-8 text-left">
//       <div className="w-full max-w-6xl flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
//         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-row justify-between items-center w-full">
//           <div>
//             <p className="text-blue-600 font-bold text-xs md:text-sm mb-1 uppercase tracking-widest italic">
//               {quiz.title}
//             </p>
//             <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter">
//               Question {currentIndex + 1}{" "}
//               <span className="text-gray-200 font-light">/</span>{" "}
//               {questions.length}
//             </h2>
//           </div>
//           <QuizTimer />
//         </div>

//         <div className="bg-white p-8 md:p-14 rounded-[3rem] shadow-xl border border-gray-100 w-full min-h-[550px] flex flex-col">
//           <h3 className="text-3xl md:text-5xl font-black text-slate-800 mb-14 leading-tight">
//             {currentQ.text}
//           </h3>

//           <div className="flex flex-col gap-5 w-full flex-1">
//             {currentQ.options.map((opt: string, i: number) => {
//               const isSelected = answers[currentQ.id] === i.toString();
//               return (
//                 <button
//                   key={i}
//                   onClick={() => setAnswer(currentQ.id, i.toString())}
//                   className={`flex items-center justify-between p-6 md:p-8 rounded-[2rem] border-2 transition-all duration-300 group ${isSelected
//                     ? "border-blue-600 bg-blue-50/50 shadow-md scale-[1.01]"
//                     : "border-gray-100 bg-white hover:border-blue-200"
//                     }`}
//                 >
//                   <div className="flex items-center gap-6">
//                     <span className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-black text-xl md:text-3xl border-2 ${isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-400 border-gray-100"}`}>
//                       {String.fromCharCode(65 + i)}
//                     </span>
//                     <span className={`text-xl md:text-3xl font-bold ${isSelected ? "text-blue-900" : "text-slate-600"}`}>
//                       {opt}
//                     </span>
//                   </div>
//                   {isSelected && <CheckCircle2 className="text-blue-600" size={32} />}
//                 </button>
//               );
//             })}
//           </div>

//           <div className="mt-16 pt-10 border-t border-gray-100 flex items-center justify-between w-full">
//             <button
//               disabled={currentIndex === 0}
//               onClick={prevQuestion}
//               className="flex items-center gap-2 px-8 py-4 font-bold text-gray-400 hover:text-slate-800 disabled:opacity-20 transition-all text-xl"
//             >
//               <ChevronLeft size={24} /> Previous
//             </button>

//             <div className="flex gap-4">
//               <button
//                 onClick={skipQuestion}
//                 className="flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-orange-100 text-orange-600 font-bold hover:bg-orange-50 transition-all text-xl"
//               >
//                 Skip <FastForward size={24} />
//               </button>
//               <button
//                 disabled={submitQuizMutation.isPending}
//                 onClick={isLast ? handleSubmit : nextQuestion}
//                 className="flex items-center gap-2 px-14 py-4 rounded-2xl bg-blue-600 text-white font-black shadow-xl hover:bg-blue-700 active:scale-95 transition-all text-xl disabled:opacity-50"
//               >
//                 {isLast
//                   ? (submitQuizMutation.isPending ? "Submitting..." : "Finish Quiz")
//                   : "Next"}
//                 {isLast ? <CheckCircle2 size={24} /> : <ChevronRight size={24} />}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, FastForward, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuiz, useStartQuiz, useSubmitQuiz } from "@/hooks/useQuizzes";
import { useQuizStore } from "@/store/useQuizStore";
import { QuizTimer } from "@/components/student/QuizTimer";

export default function QuizPage() {
  const router = useRouter();
  const { id: quizId } = useParams<{ id: string }>();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null); // جديد: تخزين رسالة الخطأ

  const currentIndex = useQuizStore((s) => s.currentIndex);
  const isStarted = useQuizStore((s) => s.isStarted);
  const isFinished = useQuizStore((s) => s.isFinished);
  const answers = useQuizStore((s) => s.answers);
  const startQuiz = useQuizStore((s) => s.startQuiz);
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const nextQuestion = useQuizStore((s) => s.nextQuestion);
  const prevQuestion = useQuizStore((s) => s.prevQuestion);
  const skipQuestion = useQuizStore((s) => s.skipQuestion);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);

  const { data: quiz, isLoading } = useQuiz(quizId);
  const startQuizMutation = useStartQuiz();
  const submitQuizMutation = useSubmitQuiz();

  const handleSubmit = () => {
    const numericAnswers: Record<string, number> = {};
    Object.entries(answers).forEach(([qId, val]) => {
      numericAnswers[qId] = parseInt(val, 10);
    });

    submitQuizMutation.mutate(
      { quizId, attemptId: attemptId ?? "", answers: numericAnswers },
      {
   
        onSuccess: (data) => {
          router.push(
            `/student/quizzes/result?courseId=${quiz?.courseId}&score=${data.score}&passed=${data.passed}&examName=${encodeURIComponent(quiz?.title ?? "Course Exam")}`
          );
        },
        onError: (err) => {
          console.error("❌ err:", err);
        },
      }
    );
  };

  useEffect(() => {
    if (!quiz || isStarted || startError) return; // مانعاودش المحاولة لو فيه خطأ بالفعل
    resetQuiz();
    startQuizMutation.mutate(quizId, {
      onSuccess: (data) => {
        setAttemptId(data.attemptId);
        startQuiz(quiz.timeLimit ?? 600);
      },
      onError: (err: any) => {
        console.error("Failed to start quiz:", err);
        // جديد: نسحب رسالة الخطأ القادمة من الـ backend (403 مثلاً)
        const message =
          err?.response?.data?.message ||
          "حدث خطأ غير متوقع أثناء بدء الاختبار";
        setStartError(message);
      },
    });
  }, [quiz, isStarted, startError]);

  if (isLoading || startQuizMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
        <p className="text-slate-400 font-black tracking-widest uppercase text-xs animate-pulse">
          Loading Assessment...
        </p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
        <p className="text-red-400 font-bold">Quiz not found</p>
        <button onClick={() => router.back()} className="mt-4 px-6 py-2 bg-slate-100 rounded-xl text-slate-600 font-bold">
          ← Back
        </button>
      </div>
    );
  }

  // جديد: شاشة واضحة لو فشل بدء الاختبار (مكتمل قبل كده / غير مسجل / أي سبب)
  if (startError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4">
        <div className="text-center bg-white p-12 md:p-16 rounded-[3rem] shadow-xl border border-gray-100 max-w-xl w-full">
          <div className="mb-6 flex justify-center text-amber-500">
            <AlertCircle size={56} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-4">
            تعذّر بدء الاختبار
          </h2>
          <p className="text-slate-500 font-medium mb-8 text-lg">{startError}</p>
          <button
            onClick={() => router.push("/student/quizzes")}
            className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            الرجوع لقائمة الاختبارات
          </button>
        </div>
      </div>
    );
  }

  const questions = quiz.questions ?? [];
  const currentQ = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4 animate-in fade-in zoom-in duration-500">
        <div className="text-center bg-white p-12 md:p-20 rounded-[3.5rem] shadow-2xl border border-blue-50 max-w-3xl w-full">
          <div className="mb-8 flex justify-center text-7xl animate-bounce">🥳</div>
          <h2 className="text-4xl md:text-6xl font-black text-blue-600 mb-6 tracking-tight">
            Quiz Completed!
          </h2>
          <button
            disabled={submitQuizMutation.isPending}
            onClick={handleSubmit}
            className="px-14 py-4 bg-blue-600 text-white text-xl font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3 mx-auto disabled:opacity-50"
          >
            {submitQuizMutation.isPending ? "Calculating Score..." : "View Result & Certificate"}
            {!submitQuizMutation.isPending && <CheckCircle2 size={24} />}
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="w-full min-h-full flex flex-col items-center p-4 md:p-8 text-left">
      <div className="w-full max-w-6xl flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-row justify-between items-center w-full">
          <div>
            <p className="text-blue-600 font-bold text-xs md:text-sm mb-1 uppercase tracking-widest italic">
              {quiz.title}
            </p>
            <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter">
              Question {currentIndex + 1}{" "}
              <span className="text-gray-200 font-light">/</span>{" "}
              {questions.length}
            </h2>
          </div>
          <QuizTimer />
        </div>

        <div className="bg-white p-8 md:p-14 rounded-[3rem] shadow-xl border border-gray-100 w-full min-h-[550px] flex flex-col">
          <h3 className="text-3xl md:text-5xl font-black text-slate-800 mb-14 leading-tight">
            {currentQ.text}
          </h3>

          <div className="flex flex-col gap-5 w-full flex-1">
            {currentQ.options.map((opt: string, i: number) => {
              const isSelected = answers[currentQ.id] === i.toString();
              return (
                <button
                  key={i}
                  onClick={() => setAnswer(currentQ.id, i.toString())}
                  className={`flex items-center justify-between p-6 md:p-8 rounded-[2rem] border-2 transition-all duration-300 group ${isSelected
                    ? "border-blue-600 bg-blue-50/50 shadow-md scale-[1.01]"
                    : "border-gray-100 bg-white hover:border-blue-200"
                    }`}
                >
                  <div className="flex items-center gap-6">
                    <span className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-black text-xl md:text-3xl border-2 ${isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-400 border-gray-100"}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={`text-xl md:text-3xl font-bold ${isSelected ? "text-blue-900" : "text-slate-600"}`}>
                      {opt}
                    </span>
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
                disabled={submitQuizMutation.isPending}
                onClick={isLast ? handleSubmit : nextQuestion}
                className="flex items-center gap-2 px-14 py-4 rounded-2xl bg-blue-600 text-white font-black shadow-xl hover:bg-blue-700 active:scale-95 transition-all text-xl disabled:opacity-50"
              >
                {isLast
                  ? (submitQuizMutation.isPending ? "Submitting..." : "Finish Quiz")
                  : "Next"}
                {isLast ? <CheckCircle2 size={24} /> : <ChevronRight size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}