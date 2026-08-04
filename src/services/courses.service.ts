import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/lib/api/courses.api";
import { apiClient } from "@/lib/api/client";
import { Course } from "@/types";

export const courseKeys = {
  all: ["teacher-courses"] as const,
  admin: ["admin-courses"] as const,
  // FE-C03: changed from "courses" to "teacher-courses"
  // FE-C03: new key for admin
  public: ["public-courses"] as const,
  byId: (id: string) => ["courses", id] as const,
};

// fetch the teacher's courses
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

// FE-C03: new hook for admin that fetches all courses
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

// fetch public courses for the student
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

// fetch a single course by ID
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

// create a new course
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

// delete a course
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      // invalidate both
    },
  });
};

// update a course
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> }) =>
      coursesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      // invalidate both
    },
  });
};