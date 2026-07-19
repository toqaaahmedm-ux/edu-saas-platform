import { apiClient } from './client';

// matches backend/attendance/attendance.controller.ts
export const attendanceApi = {
  markBulk: async (
    lessonId: string,
    records: { studentId: string; status: string; note?: string }[],
  ) => {
    return await apiClient.post(`/lessons/${lessonId}/attendance/bulk`, { records });
  },

  getByLesson: async (lessonId: string) => {
    return await apiClient.get<{ success: boolean; data: any[] }>(
      `/lessons/${lessonId}/attendance`,
    );
  },

  getMySummary: async (courseId: string) => {
    return await apiClient.get<{ success: boolean; data: any }>(
      `/courses/${courseId}/attendance/me`,
    );
  },

  getStudentSummary: async (courseId: string, studentId: string) => {
    return await apiClient.get<{ success: boolean; data: any }>(
      `/courses/${courseId}/attendance/student/${studentId}`,
    );
  },
};