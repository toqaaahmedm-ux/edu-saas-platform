import { apiClient } from './client';

export const teacherApi = {
  getDashboardStats: async () => {
    return apiClient.get('/teacher/stats');
  },
  getMyCourses: async () => {
    return apiClient.get('/teacher/courses');
  },
  getStudents: async () => {
    
    return apiClient.get('/teacher/students'); 
  }
};