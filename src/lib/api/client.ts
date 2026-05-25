import axios from 'axios';

export const apiClient = axios.create({
  // إذا كان السيرفر هو نفس مشروع الـ Next.js، اتركيها '/api' 
  // ولكن تأكدي أن مسار الملف هو src/app/api/courses/route.ts
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  async (response) => {
  
    return response;
  },
  (error) => {
    // إضافة معالجة للأخطاء هنا عشان نعرف السبب الحقيقي للـ 405
    console.error("API Error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);