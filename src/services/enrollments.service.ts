import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export const useEnrollments = () => {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      try {
        // FIXBUG-07: بنكال NestJS مباشرةً بدل Next.js API المحلي
        const response = await apiClient.get("/enrollments/my");
        const data = response.data as any;
        return Array.isArray(data?.data) ? data.data : [];
      } catch {
        return [];
      }
    },
    enabled: typeof window !== 'undefined',
  });
};

export const useEnroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      // FIXBUG-07: بنكال NestJS مباشرةً بدل Next.js API المحلي
      const response = await apiClient.post("/enrollments", { courseId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

// ADD this hook to the END of your existing enrollments.service.ts file
// (below useEnroll). Don't touch useEnrollments or useEnroll — this is a
// separate, additional hook for the teacher's "who's enrolled in this
// course" view, using the existing GET /enrollments/course/:courseId
// endpoint that already exists in enrollments.controller.ts but had no
// frontend hook calling it yet.

export const useCourseEnrollments = (courseId: string) => {
  return useQuery({
    queryKey: ["enrollments", "course", courseId],
    queryFn: async () => {
      const response = await apiClient.get(`/enrollments/course/${courseId}`);
      const data = response.data as any;
      return Array.isArray(data?.data) ? data.data : [];
    },
    enabled: !!courseId,
  });
};