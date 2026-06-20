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