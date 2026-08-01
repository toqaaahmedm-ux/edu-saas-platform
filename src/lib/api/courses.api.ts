import { Course } from '@/types';
import { apiClient } from './client';
export interface LessonWithProgress {
  id: string;
  title: string;
  videoUrl: string | null;
  duration: number;
  order: number;
  type: string;
  isCompleted: boolean;
  // LESSON-PROGRESS-NEW: last stop point in seconds, 0 if no progress saved
  savedPosition: number;
}
export interface ModuleWithLessons {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: LessonWithProgress[];
}
export const coursesApi = {
  getAll: async (params?: { search?: string; category?: string; sortBy?: string; page?: number; limit?: number }) => {
    return await apiClient.get<{ courses: Course[]; meta: any }>('/courses', { params });
  },
  getMyCourses: async () => {
    return await apiClient.get<{ success: boolean; data: Course[] }>('/courses/teacher/my-courses');
  },
  getById: async (id: string) => {
    return await apiClient.get<{ success: boolean; data: Course }>(`/courses/${id}`);
  },
  delete: async (id: string) => {
    return await apiClient.delete(`/courses/${id}`);
  },
  update: async (id: string, data: Partial<Course>) => {
    return await apiClient.put(`/courses/${id}`, data);
  },
  create: async (courseData: Omit<Course, "id" | "createdAt">) => {
    return await apiClient.post('/courses', courseData);
  },
  // Sprint 2 / Task #2: real modules + lessons for a course, enriched with
  // the current student's completion state per lesson.
  getModules: async (courseId: string) => {
    return await apiClient.get<ModuleWithLessons[]>(`/courses/${courseId}/modules`);
  },
  // Sprint 2 / Task #1 (frontend wiring): mark a lesson complete.
  completeLesson: async (courseId: string, lessonId: string) => {
    return await apiClient.post(`/courses/${courseId}/lessons/${lessonId}/complete`, {});
  },
  // LESSON-PROGRESS-NEW: saves the last stop point in the video (in seconds) so
  // the student can resume from there next time. The frontend handles the debounce, it's
  // not called immediately on every timeupdate event.
  saveLessonProgress: async (courseId: string, lessonId: string, positionSeconds: number) => {
    return await apiClient.patch(`/courses/${courseId}/lessons/${lessonId}/progress`, {
      positionSeconds,
    });
  },
};