import { apiClient } from './client';
import { Module } from '@/types';

// Types match what the NestJS ModulesController actually returns —
// see backend/modules/modules.controller.ts (courses/:courseId/modules)
export const modulesApi = {
  getByCourse: async (courseId: string) => {
    return await apiClient.get<{ success: boolean; data: Module[] }>(
      `/courses/${courseId}/modules`,
    );
  },

  create: async (courseId: string, data: { title: string; description?: string; order?: number }) => {
    return await apiClient.post(`/courses/${courseId}/modules`, data);
  },

  update: async (courseId: string, moduleId: string, data: Partial<Module>) => {
    return await apiClient.patch(`/courses/${courseId}/modules/${moduleId}`, data);
  },

  delete: async (courseId: string, moduleId: string) => {
    return await apiClient.delete(`/courses/${courseId}/modules/${moduleId}`);
  },
};