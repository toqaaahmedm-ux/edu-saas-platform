import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export const useEnrollments = () => {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      try {
        // بنكال Next.js API مش NestJS مباشرةً
        const response = await fetch('/api/enrollments', {
          credentials: 'include',
        });
        if (!response.ok) return [];
        const data = await response.json();
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
      // بنكال Next.js API مش NestJS مباشرةً
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to enroll');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};