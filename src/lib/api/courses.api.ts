import { Course } from '@/types';
import { apiClient } from './client';

export const coursesApi = {
  // جلب كل الكورسات العامة
  getAll: async () => {
    return await apiClient.get<{ success: boolean; data: Course[] }>('/courses');
  },

  // جلب كورسات المعلم
  getMyCourses: async () => {
    return await apiClient.get<{ success: boolean; data: Course[] }>('/courses/teacher/my-courses');
  },

  getById: async (id: string) => {
    return await apiClient.get<{ success: boolean; data: Course }>(`/courses/${id}`);
  },

  delete: async (id: string) => {
    return await apiClient.delete(`/courses/${id}`);
  },

  update: async (id: string, data: Partial<Course>) => {
    return await apiClient.put(`/courses/${id}`, data);
  },

  create: async (courseData: Omit<Course, "id" | "createdAt">) => {
    return await apiClient.post('/courses', courseData);
  }
};