import { useQuery, useMutation } from '@tanstack/react-query';
import { quizzesApi } from '@/lib/api/quizzes.api';
import { useQuizStore } from '@/store/useQuizStore';

export const useQuizzes = () => {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const response = await quizzesApi.getAll();
      return response.data.data || response.data;
    },
  });
};

export const useSubmitQuiz = () => {
  const startedAt = useQuizStore((state) => state.startedAt);
  
  return useMutation({
    mutationFn: async (studentAnswers: Record<string, string>) => {

const response = await quizzesApi.submitScore(studentAnswers, startedAt?.toString());
      return response.data;
    },
  });
};