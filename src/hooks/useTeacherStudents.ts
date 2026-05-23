import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '@/lib/api/teacher.api'; // تأكدي من إضافة getStudents هنا

export const useTeacherStudents = () => {
  return useQuery({
    queryKey: ['teacher-students'],
    queryFn: async () => {
      const response = await teacherApi.getStudents();
      return response.data.data;
    },
  });
};