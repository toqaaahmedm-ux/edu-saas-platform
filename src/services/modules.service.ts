import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { modulesApi } from "@/lib/api/modules.api";
import { Module } from "@/types";

// keyed by courseId since modules are always fetched/scoped per course,
// same idea as courseKeys.byId in courses.service.ts
export const moduleKeys = {
  byCourse: (courseId: string) => ["modules", courseId] as const,
};

// fetch all modules (with their nested lessons) for a course
export const useModules = (courseId: string) => {
  return useQuery({
    queryKey: moduleKeys.byCourse(courseId),
    queryFn: async () => {
      const response = await modulesApi.getByCourse(courseId);
      return ((response.data as any)?.data || []) as Module[];
    },
    enabled: !!courseId,
    staleTime: 0,
  });
};

export const useCreateModule = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; order?: number }) =>
      modulesApi.create(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.byCourse(courseId) });
    },
  });
};

export const useUpdateModule = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: Partial<Module> }) =>
      modulesApi.update(courseId, moduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.byCourse(courseId) });
    },
  });
};

export const useDeleteModule = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (moduleId: string) => modulesApi.delete(courseId, moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.byCourse(courseId) });
    },
  });
};