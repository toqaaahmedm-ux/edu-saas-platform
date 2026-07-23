import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export const useMyUsage = () => {
  return useQuery({
    queryKey: ["admin", "usage", "me"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/usage/me");
      return (response.data as any)?.data ?? response.data;
    },
    staleTime: 0,
  });
};
