import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/lib/api/courses.api";
import { Course } from "@/types";



// Query Keys — مكان واحد لكل الـ keys
export const courseKeys = {
  all: ["courses"] as const,
  byId: (id: string) => ["courses", id] as const,
};

// جلب كل الكورسات
export const useCourses = () => {
  return useQuery({
    queryKey: courseKeys.all,
    queryFn: async () => {
      const response = await coursesApi.getAll();
      return (response.data?.data || []) as Course[];
    },
    staleTime: 0,
    refetchOnWindowFocus :true,
      

  });
};

//  جلب كورس واحد بالـ ID
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: courseKeys.byId(id),
    queryFn: async () => {
      const response = await coursesApi.getById(id);
      return response.data?.data as Course;
    },
    enabled: !!id, // مش هيشتغل لو مفيش ID
  });
};

//  إنشاء كورس جديد
export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Course, "id" | "createdAt">) =>
      coursesApi.create(data),
    onSuccess: () => {
      // بعد الإنشاء — تحديث قائمة الكورسات تلقائياً
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
};

// حذف كورس
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => {
      // بعد الحذف — تحديث القائمة تلقائياً
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
};
// تحديث كورس
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> }) =>
      coursesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.all,
        refetchType: 'all'
      });
    },
  });
};