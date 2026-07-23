import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export const useTenantBranding = () => {
  return useQuery({
    queryKey: ["tenant", "branding", "me"],
    queryFn: async () => {
      const response = await apiClient.get("/tenants/me/branding-self");
      return (response.data as any)?.data ?? response.data;
    },
    staleTime: 0,
  });
};

export const useUpdateBranding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { displayName?: string; logoUrl?: string; primaryColor?: string }) =>
      apiClient.patch("/tenants/branding", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", "branding", "me"] });
    },
  });
};
