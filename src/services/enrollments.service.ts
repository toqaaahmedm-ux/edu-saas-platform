import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export const useEnrollments = () => {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/enrollments/my");
        const data = response.data;
        return Array.isArray(data) ? data : (data?.data || data?.enrollments || []);
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
      const response = await apiClient.post("/enrollments", { courseId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
};