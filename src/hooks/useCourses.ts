import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses.api';

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      try {
        const response = await coursesApi.getAll();
        console.log("===============================");
        console.log("1. API Response Data:", response.data);
        console.log("===============================");
        return response.data;
      } catch (error) {
        console.error("===============================");
        console.error("API Fetch Error Failed:", error);
        console.error("===============================");
        throw error;
      }
    },
  });
};