import { apiClient } from './client';

export const quizzesApi = {
  // جلب quiz معين بالـ id
  getQuiz: async (quizId: string) => {
    return apiClient.get(`/quiz/${quizId}`);
  },

  // بدء محاولة
  startQuiz: async (quizId: string) => {
    return apiClient.post(`/quiz/${quizId}/start`, {});
  },

  // تسليم الإجابات — الباك إند مش بيستخدم attemptId من الـ body
  submitQuiz: async (
    quizId: string,
    answers: { questionId: string; answer: number }[]
  ) => {
    return apiClient.post(`/quiz/${quizId}/submit`, { answers });
  },
};