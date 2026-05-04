"use client"; 
import { useEffect } from "react"; 

import { useQuizStore } from "@/store/useQuizStore"; 

export const QuizTimer = () => { 
  const { timeRemaining, tick, isStarted } = useQuizStore(); 

  useEffect(() => { 
    if (!isStarted) return; 

    // تشغيل العداد كل ثانية
    const timer = setInterval(() => { 
      tick(); 
    }, 1000); 

    return () => clearInterval(timer); 
  }, [isStarted, tick]); 

  // تنسيق الوقت (00:00) 
  const formatTime = (seconds: number) => { 
    const mins = Math.floor(seconds / 60); 
    const secs = seconds % 60; 
    return `${mins}:${secs.toString().padStart(2, "0")}`; 
  }; 

  // تحديد اللون: أحمر لو أقل من 5 دقائق (300 ثانية) 
  const isUrgent = timeRemaining < 300; 

  return ( 
    <div 
      aria-live="polite"
      className={`px-4 py-2 rounded-full font-bold text-lg transition-all ${ 
        isUrgent 
          ? "bg-red-100 text-red-600 animate-pulse border border-red-200" 
          : "bg-green-100 text-green-600 border border-green-200" 
      }`}
    > 
      ⏱️ {formatTime(timeRemaining)} 
    </div> 
  ); 
};
