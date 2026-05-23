import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '@/lib/api/teacher.api';

// Hook لجلب إحصائيات المدرس الحية من السيرفر
export const useTeacherStats = () => {
  return useQuery({
    queryKey: ['teacher-stats'],
    queryFn: async () => {
      const response = await teacherApi.getDashboardStats();
      return response.data.data;
    },
  });
};