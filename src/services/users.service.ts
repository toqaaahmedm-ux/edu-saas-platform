import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { User } from "@/types";

//  Query Keys
export const userKeys = {
  all: ["users"] as const,
  byId: (id: string) => ["users", id] as const,
};

// جلب كل اليوزرز (للـ Admin)
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: User[] }>("/users");
      return (response.data?.data || []) as User[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// حذف يوزر
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};