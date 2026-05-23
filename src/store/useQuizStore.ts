import { create } from "zustand";
import { persist } from "zustand/middleware";

interface QuizState {
  currentIndex: number;
  answers: Record<string, string>;
  timeRemaining: number;
  isStarted: boolean;
  isFinished: boolean;
  score: number | null;
  startedAt: number | null; // timestamp لـ server validation
  startQuiz: (time: number) => void;
  setAnswer: (questionId: string, value: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  skipQuestion: () => void;
  tick: () => void;
  completeQuiz: (finalScore?: number) => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      currentIndex: 0,
      answers: {},
      timeRemaining: 3600,
      isStarted: false,
      isFinished: false,
      score: null,
      startedAt: null,

      startQuiz: (time) => set({
        isStarted: true,
        isFinished: false,
        timeRemaining: time,
        currentIndex: 0,
        answers: {},
        score: null,
        startedAt: Date.now(), // حفظ وقت البداية
      }),

      setAnswer: (id, val) => set((state) => ({
        answers: { ...state.answers, [id]: val }
      })),

      nextQuestion: () => set((state) => ({ currentIndex: state.currentIndex + 1 })),
      prevQuestion: () => set((state) => ({ currentIndex: state.currentIndex - 1 })),
      skipQuestion: () => set((state) => ({ currentIndex: state.currentIndex + 1 })),

      tick: () => set((state) => {
        if (state.timeRemaining <= 0) {
          return { timeRemaining: 0, isFinished: true, isStarted: false };
        }
        return { timeRemaining: state.timeRemaining - 1 };
      }),

      completeQuiz: (finalScore) => set({
        isFinished: true,
        isStarted: false,
        score: finalScore ?? 0
      }),

      resetQuiz: () => set({
        currentIndex: 0,
        answers: {},
        isStarted: false,
        isFinished: false,
        timeRemaining: 3600,
        score: null,
        startedAt: null,
      }),
    }),
    { name: "quiz-storage" }
  )
);