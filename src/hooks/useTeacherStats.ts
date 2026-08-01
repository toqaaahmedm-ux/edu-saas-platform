import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '@/lib/api/teacher.api';

// Hook to fetch the teacher's live stats from the server
export const useTeacherStats = () => {
  return useQuery({
    queryKey: ['teacher-stats'],
    queryFn: async () => {
      const response = await teacherApi.getDashboardStats();
      return response.data.data;
    },
  });
};