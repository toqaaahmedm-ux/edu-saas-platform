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

  // HIGH-15 FIX: قبل كده الـ register كانت بتبعت name/email/password بس،
  // والـ role اللي بيختاره المستخدم من الـ dropdown (طالب/معلم) كان بيتجاهل
  // تماماً — كل المستخدمين الجدد كانوا بيتسجلوا بـ role افتراضي من الباك إند
  // بغض النظر عن اختيارهم. دلوقتي بنضيف role في جسم الطلب.
  register: async (data: {
    name: string;
    email: string;
    password: string;
    role?: 'STUDENT' | 'TEACHER';
  }) => {
    const response = await apiClient.post('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role ?? 'STUDENT', // الـ default طالب لو مش محدد
    });
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