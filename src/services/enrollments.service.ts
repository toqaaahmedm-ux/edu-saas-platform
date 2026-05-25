import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Course } from "@/types";

// جلب الكورسات المسجل فيها
export const useEnrollments = () => {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const response = await fetch("/api/enrollments");
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      return result.data as Course[];
    },
  });
};

// التسجيل في كورس
export const useEnroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
};