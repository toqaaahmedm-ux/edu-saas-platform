import { apiClient } from './client';

// separate file from the existing users API so nothing already working
// there gets touched — matches backend/users/users.controller.ts's new
// pending-teachers/approve/reject routes
export const pendingTeachersApi = {
  getAll: () => apiClient.get<{ success: boolean; data: any[] }>('/admin/users/pending-teachers'),
  approve: (id: string) => apiClient.patch(`/admin/users/${id}/approve`),
  reject: (id: string) => apiClient.patch(`/admin/users/${id}/reject`),
};