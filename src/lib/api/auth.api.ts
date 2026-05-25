import { LoginInput } from '@/lib/validators/auth.schema';

export const authApi = {
  login: async (data: LoginInput) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw { response: { data: result } };
    }

    return result;
  },

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    return { success: true };
  },
};