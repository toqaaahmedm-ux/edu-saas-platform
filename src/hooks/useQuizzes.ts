import { useQuery, useMutation } from '@tanstack/react-query';
import { quizzesApi } from '@/lib/api/quizzes.api';

// جلب quiz معين
export const useQuiz = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const response = await quizzesApi.getQuiz(quizId);
      return response.data.data || response.data;
    },
    enabled: !!quizId,
  });
};

// بدء محاولة
export const useStartQuiz = () => {
  return useMutation({
    mutationFn: async (quizId: string) => {
      const response = await quizzesApi.startQuiz(quizId);
      return response.data.data || response.data;
    },
  });
};
export const useSubmitQuiz = () => {
  return useMutation({
    mutationFn: async ({
      quizId,
      attemptId,
      answers,
    }: {
      quizId: string;
      attemptId: string;
      answers: Record<string, number>;
    }) => {
      const formatted = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      const response = await quizzesApi.submitQuiz(quizId, formatted);
      // الباكند بيرجع { success, data: { score, correct, total, passed } }
      const result = response.data?.data || response.data;
      return {
        score: result?.score ?? 0,
        correct: result?.correct ?? 0,
        total: result?.total ?? 0,
        passed: result?.passed ?? false,
      };
    },
  });
};