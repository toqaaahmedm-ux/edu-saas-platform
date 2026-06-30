import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/lib/api/courses.api";
import { apiClient } from "@/lib/api/client";
import { Course } from "@/types";

export const courseKeys = {
  all: ["teacher-courses"] as const,      // ✅ FE-C03: غيرنا من "courses" لـ "teacher-courses"
  admin: ["admin-courses"] as const,       // ✅ FE-C03: key جديد للـ admin
  public: ["public-courses"] as const,
  byId: (id: string) => ["courses", id] as const,
};

// جلب كورسات المعلم
export const useCourses = () => {
  return useQuery({
    queryKey: courseKeys.all,
    queryFn: async () => {
      const response = await coursesApi.getMyCourses();
      return ((response.data as any)?.data || []) as Course[];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

// ✅ FE-C03: hook جديد للـ admin بيجيب كل الكورسات
export const useAdminCourses = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...courseKeys.admin, page, limit],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/admin/all?page=${page}&limit=${limit}`);
      return ((res.data as any)?.data?.courses ?? []) as Course[];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

// جلب الكورسات العامة للطالب
export const usePublicCourses = () => {
  return useQuery({
    queryKey: courseKeys.public,
    queryFn: async () => {
      const response = await coursesApi.getAll();
      return ((response.data as any)?.data?.courses || []) as Course[];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

// جلب كورس واحد بالـ ID
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: courseKeys.byId(id),
    queryFn: async () => {
      const response = await coursesApi.getById(id);
      return response.data?.data as Course;
    },
    enabled: !!id,
  });
};

// إنشاء كورس جديد
export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Course, "id" | "createdAt">) =>
      coursesApi.create(data),
    onSuccess: () => {
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
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      queryClient.invalidateQueries({ queryKey: courseKeys.admin }); // ✅ invalidate الاتنين
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
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      queryClient.invalidateQueries({ queryKey: courseKeys.admin }); // ✅ invalidate الاتنين
    },
  });
};