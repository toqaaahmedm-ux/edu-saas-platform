import { apiClient } from './client';

export const liveSessionsApi = {
  getByCourse: async (courseId: string) => {
    return await apiClient.get<{ success: boolean; data: any[] }>(`/live-sessions?courseId=${courseId}`);
  },
  create: async (courseId: string, body: { title: string; meetingUrl: string; scheduledAt: string; durationMinutes?: number }) => {
    return await apiClient.post(`/live-sessions`, { courseId, ...body });
  },
  update: async (id: string, body: any) => {
    return await apiClient.patch(`/live-sessions/${id}`, body);
  },
  remove: async (id: string) => {
    return await apiClient.delete(`/live-sessions/${id}`);
  },
};