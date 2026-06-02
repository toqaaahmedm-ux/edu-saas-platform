import { apiClient } from './client';

export const teacherApi = {
  getDashboardStats: async () => {
    return apiClient.get('/courses/teacher/stats');
  },
  getMyCourses: async () => {
    return apiClient.get('/courses/teacher/my-courses');
  },
  getStudents: async () => {
    return apiClient.get('/courses/teacher/students');
  }
};