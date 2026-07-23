import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export const useAcademicOverview = () => {
  return useQuery({
    queryKey: ["admin", "analytics", "academic"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/analytics/academic");
      return (response.data as any)?.data ?? response.data;
    },
    staleTime: 0,
  });
};
