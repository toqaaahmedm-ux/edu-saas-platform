import axios from 'axios';

// إنشاء نسخة Axios مخصصة (مطابق للصورة)
export const apiClient = axios.create({
  baseURL: '/api', // مسار وهمي حالياً
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.response.use(async (response) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return response;
});
