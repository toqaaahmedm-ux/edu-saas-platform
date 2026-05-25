import { apiClient } from './client';

export const quizzesApi = {
  getAll: async () => {
    return apiClient.get('/quizzes');
  },

  submitScore: async (studentAnswers: Record<string, string>, sessionId?: string | null) => {
    return apiClient.post('/quiz/submit', { answers: studentAnswers, sessionId });
  },
};