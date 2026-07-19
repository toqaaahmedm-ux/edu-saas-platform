import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gradesApi } from "@/lib/api/grades.api";

export const gradeKeys = {
  byCourse: (courseId: string) => ["grades", courseId] as const,
  mine: (courseId: string) => ["grades", courseId, "me"] as const,
};

export const useCourseGrades = (courseId: string) => {
  return useQuery({
    queryKey: gradeKeys.byCourse(courseId),
    queryFn: async () => {
      const response = await gradesApi.getByCourse(courseId);
      return (response.data as any)?.data || [];
    },
    enabled: !!courseId,
    staleTime: 0,
  });
};

// returns null instead of throwing when the grade hasn't been computed
// yet, so the page can show "not graded yet" instead of an error screen
export const useMyGrade = (courseId: string) => {
  return useQuery({
    queryKey: gradeKeys.mine(courseId),
    queryFn: async () => {
      try {
        const response = await gradesApi.getMine(courseId);
        return (response.data as any)?.data;
      } catch {
        return null;
      }
    },
    enabled: !!courseId,
  });
};

export const useRecomputeGrade = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => gradesApi.recompute(courseId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.byCourse(courseId) });
    },
  });
};