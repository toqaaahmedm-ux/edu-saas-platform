import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/lib/api/courses.api";
import { apiClient } from "@/lib/api/client";
import { Course } from "@/types";

export const courseKeys = {
  all: ["teacher-courses"] as const,      // âœ… FE-C03: ØºÙŠØ±Ù†Ø§ Ù…Ù† "courses" Ù„Ù€ "teacher-courses"
  admin: ["admin-courses"] as const,       // âœ… FE-C03: key Ø¬Ø¯ÙŠØ¯ Ù„Ù„Ù€ admin
  public: ["public-courses"] as const,
  byId: (id: string) => ["courses", id] as const,
};

// Ø¬Ù„Ø¨ ÙƒÙˆØ±Ø³Ø§Øª Ø§Ù„Ù…Ø¹Ù„Ù…
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

// âœ… FE-C03: hook Ø¬Ø¯ÙŠØ¯ Ù„Ù„Ù€ admin Ø¨ÙŠØ¬ÙŠØ¨ ÙƒÙ„ Ø§Ù„ÙƒÙˆØ±Ø³Ø§Øª
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

// Ø¬Ù„Ø¨ Ø§Ù„ÙƒÙˆØ±Ø³Ø§Øª Ø§Ù„Ø¹Ø§Ù…Ø© Ù„Ù„Ø·Ø§Ù„Ø¨
export interface CourseFilters {
  search?: string;
  category?: string;
  sortBy?: string;
}

export const usePublicCourses = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: [...courseKeys.public, filters],
    queryFn: async () => {
      const response = await coursesApi.getAll(filters);
      const data = response.data as any;
      return (data?.courses ?? data?.data?.courses ?? []) as Course[];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

// Ø¬Ù„Ø¨ ÙƒÙˆØ±Ø³ ÙˆØ§Ø­Ø¯ Ø¨Ø§Ù„Ù€ ID
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

// Ø¥Ù†Ø´Ø§Ø¡ ÙƒÙˆØ±Ø³ Ø¬Ø¯ÙŠØ¯
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

// Ø­Ø°Ù ÙƒÙˆØ±Ø³
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      queryClient.invalidateQueries({ queryKey: courseKeys.admin }); // âœ… invalidate Ø§Ù„Ø§ØªÙ†ÙŠÙ†
    },
  });
};

// ØªØ­Ø¯ÙŠØ« ÙƒÙˆØ±Ø³
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> }) =>
      coursesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      queryClient.invalidateQueries({ queryKey: courseKeys.admin }); // âœ… invalidate Ø§Ù„Ø§ØªÙ†ÙŠÙ†
    },
  });
};