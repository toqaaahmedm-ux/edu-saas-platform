import { apiClient } from './client';

export const quizzesApi = {
  // ─── Student ───────────────────────────────────────────────────────────────
  getQuiz: async (quizId: string) => {
    return apiClient.get(`/quiz/${quizId}`);
  },
  startQuiz: async (quizId: string) => {
    return apiClient.post(`/quiz/${quizId}/start`, {});
  },
  submitQuiz: async (
    quizId: string,
    answers: { questionId: string; answer: number }[]
  ) => {
    return apiClient.post(`/quiz/${quizId}/submit`, { answers });
  },

  // ─── Teacher (جديدة) ────────────────────────────────────────────────────────
  // T-01 FIX: إنشاء quiz مربوط بكورس حقيقي
  createQuiz: async (data: {
    courseId: string;
    title: string;
    timeLimit?: number;
    passScore?: number;
    questions: {
      text: string;
      options: string[];
      correctIndex: number;
    }[];
  }) => {
    return apiClient.post('/quiz/teacher/create', data);
  },

  // جلب كويزات كورس معين
  getQuizzesByCourse: async (courseId: string) => {
    return apiClient.get(`/quiz/teacher/course/${courseId}`);
  },

  // حذف quiz
  deleteQuiz: async (quizId: string) => {
    return apiClient.delete(`/quiz/teacher/${quizId}`);
  },
};