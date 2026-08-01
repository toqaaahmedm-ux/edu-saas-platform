import { LoginInput } from '@/lib/validators/auth.schema';
import { apiClient } from './client';

export const authApi = {
  login: async (data: LoginInput) => {
    // calling the Next.js API here, not NestJS directly
    // so the cookies get set correctly from the server
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

  // HIGH-15 FIX: before this, register was only sending name/email/password,
  // and the role the user picked from the dropdown (student/teacher) was being ignored
  // completely — every new user was registered with a default role from the backend
  // regardless of what they chose. Now we add the role to the request body.
  register: async (data: {
    name: string;
    email: string;
    password: string;
    role?: 'STUDENT' | 'TEACHER';
  }) => {
    // Switched this from a direct apiClient (axios) call to the backend
    // over to our own Next.js proxy route. Two reasons: (1) it avoids
    // CORS entirely since the browser only ever talks to its own origin,
    // and (2) tenant resolution now happens in exactly one place
    // (route.ts) instead of being duplicated between the browser and
    // the server.
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role ?? 'STUDENT',
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw { response: { data: err } };
    }

    return response.json();
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