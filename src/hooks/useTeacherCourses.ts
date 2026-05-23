import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '@/lib/api/teacher.api';

// Hook لجلب كورسات المدرس بشكل ديناميكي
export const useTeacherCourses = () => {
  return useQuery({
    queryKey: ['teacher-courses'],
    queryFn: async () => {
      const response = await teacherApi.getMyCourses();
      return response.data.data;
    },
  });
};