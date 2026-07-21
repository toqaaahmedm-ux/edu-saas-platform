import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { User } from "@/types";
export const userKeys = {
  all: ["users"] as const,
  byId: (id: string) => ["users", id] as const,
};
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: async () => {
      // Bug #6 FIX: backend route moved from /admin/users to /users/admin
      const response = await apiClient.get("/users/admin");
      const result = response.data?.data;
      return (Array.isArray(result) ? result : result?.users || []) as User[];
    },
    staleTime: 5 * 60 * 1000,
  });
};
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Bug #6 FIX: backend route moved from /admin/users/:id to /users/admin/:id
    mutationFn: (id: string) => apiClient.delete(`/users/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};