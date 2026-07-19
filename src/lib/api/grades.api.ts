import { apiClient } from './client';

// matches backend/grades/grades.controller.ts
export const gradesApi = {
  getByCourse: async (courseId: string) => {
    return await apiClient.get<{ success: boolean; data: any[] }>(`/courses/${courseId}/grades`);
  },

  getMine: async (courseId: string) => {
    return await apiClient.get<{ success: boolean; data: any }>(`/courses/${courseId}/grades/me`);
  },

  recompute: async (courseId: string, studentId: string) => {
    return await apiClient.post(`/courses/${courseId}/grades/recompute/${studentId}`);
  },

  updateNotes: async (courseId: string, gradeId: string, notes: string) => {
    return await apiClient.patch(`/courses/${courseId}/grades/${gradeId}/notes`, { notes });
  },
};