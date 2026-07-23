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

// NEW (REQ-02): admin creates a teacher or student directly, no
// self-registration needed. Mirrors useDeleteUser's shape.
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      role: "TEACHER" | "STUDENT";
      password: string;
      sendInvite?: boolean;
    }) => apiClient.post("/users/admin", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

// NEW (REQ-01 / Bug #2): admin approval queue for self-registered teachers.
export const usePendingTeachers = () => {
  return useQuery({
    queryKey: ["users", "pending"],
    queryFn: async () => {
      const response = await apiClient.get("/users/admin/pending");
      return (response.data?.data ?? response.data ?? []) as {
        id: string;
        name: string;
        email: string;
        createdAt: string;
      }[];
    },
    staleTime: 60 * 1000,
  });
};

export const useApproveTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`/users/admin/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "pending"] });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useRejectTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`/users/admin/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "pending"] });
    },
  });
};
