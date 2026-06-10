import { LoginInput } from '@/lib/validators/auth.schema';
import { apiClient } from './client';

export const authApi = {
  login: async (data: LoginInput) => {
    // بنكال Next.js API مش NestJS مباشرةً
    // عشان الـ cookies تتضبط صح من السيرفر
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw { response: { data: err } };
    }
    const json = await response.json();
    return json;
  },

  register: async (data: { name: string; email: string; password: string }) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    return { success: true };
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};