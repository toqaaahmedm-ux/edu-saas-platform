import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pendingTeachersApi } from "@/lib/api/pending-teachers.api";

const key = ["pending-teachers"] as const;

export const usePendingTeachers = () => {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const res = await pendingTeachersApi.getAll();
      return (res.data as any)?.data || [];
    },
    staleTime: 0,
  });
};

export const useApproveTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pendingTeachersApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
};

export const useRejectTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pendingTeachersApi.reject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
};