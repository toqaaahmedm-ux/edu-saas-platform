import { LoginInput } from '@/lib/validators/auth.schema';
import { apiClient } from './client';

export const authApi = {
  login: async (data: LoginInput) => {
    const response = await apiClient.post('/auth/login', data);
   const token = response.data?.accessToken || response.data?.data?.accessToken;
    if (token) {
      localStorage.setItem('access_token', token);
    }
    return response.data;
  },

  register: async (data: { name: string; email: string; password: string }) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('access_token');
    await apiClient.post('/auth/logout');
    return { success: true };
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};