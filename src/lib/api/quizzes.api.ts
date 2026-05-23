import { apiClient } from './client';

export const quizzesApi = {
  getAll: async () => {
    return apiClient.get('/quizzes');
  },

  submitScore: async (studentAnswers: Record<string, string>, startedAt?: number | null) => {
    return apiClient.post('/quiz/score', { studentAnswers, startedAt });
  },
};