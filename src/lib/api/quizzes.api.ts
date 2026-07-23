import { apiClient } from './client';

export const quizzesApi = {
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
  getMyLatestAttempt: async (quizId: string) => {
    return apiClient.get(`/quiz/${quizId}/my-latest-attempt`);
  },
  getMyAttempts: async (quizId: string) => {
    return apiClient.get(`/quiz/${quizId}/my-attempts`);
  },

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

  getQuizzesByCourse: async (courseId: string) => {
    return apiClient.get(`/quiz/teacher/course/${courseId}`);
  },

  deleteQuiz: async (quizId: string) => {
    return apiClient.delete(`/quiz/teacher/${quizId}`);
  },
};
