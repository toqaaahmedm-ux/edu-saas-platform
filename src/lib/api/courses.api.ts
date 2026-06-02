import { Course } from '@/types';
import { apiClient } from './client';

export const coursesApi = {
  // جلب كل الكورسات
  getAll: async () => {
    return await apiClient.get<{ success: boolean; data: Course[] }>('/courses');
  },

  
  getById: async (id: string) => {
    return await apiClient.get<{ success: boolean; data: Course }>(`/courses/${id}`);
  },

  // حذف كورس معين
  delete: async (id: string) => {
    return await apiClient.delete(`/courses/${id}`);
  },
// تحديث كورس
  update: async (id: string, data: Partial<Course>) => {
    return await apiClient.put(`/courses/${id}`, data);
  },
  // إضافة كورس جديد
  create: async (courseData: Omit<Course, "id" | "createdAt">) => {
    return await apiClient.post('/courses', courseData);
  }
};