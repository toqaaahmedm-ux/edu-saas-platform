import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '@/lib/api/teacher.api';

export const useTeacherStudents = () => {
  return useQuery({
    queryKey: ['teacher-students'],
    queryFn: async () => {
      const response = await teacherApi.getStudents();
      // API returns { students: [...], total: N }
      // extract the array so .map() works in the component
      const payload = response.data?.data ?? response.data;
      return Array.isArray(payload) ? payload : (payload?.students ?? []);
    },
  });
};