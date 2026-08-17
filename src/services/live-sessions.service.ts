import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { liveSessionsApi } from "@/lib/api/live-sessions.api";

export const liveSessionKeys = {
  byCourse: (courseId: string) => ["liveSessions", courseId] as const,
};

export const useCourseLiveSessions = (courseId: string) => {
  return useQuery({
    queryKey: liveSessionKeys.byCourse(courseId),
    queryFn: async () => {
      const response = await liveSessionsApi.getByCourse(courseId);
      return (response.data as any)?.data || [];
    },
    enabled: !!courseId,
    staleTime: 0,
  });
};

export const useCreateLiveSession = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; meetingUrl: string; scheduledAt: string; durationMinutes?: number }) =>
      liveSessionsApi.create(courseId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: liveSessionKeys.byCourse(courseId) });
    },
  });
};

export const useDeleteLiveSession = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => liveSessionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: liveSessionKeys.byCourse(courseId) });
    },
  });
};