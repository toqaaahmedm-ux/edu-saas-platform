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

// NEW (REQ-03): admin assigns a student to a course directly, bypassing
// the payment gate. Calls POST /enrollments/admin (built in enrollments.controller.ts).
export const useAdminEnroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { studentId: string; courseId: string }) => {
      const response = await apiClient.post("/enrollments/admin", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
  });
};
