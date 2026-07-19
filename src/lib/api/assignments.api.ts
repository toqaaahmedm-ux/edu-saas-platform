import { apiClient } from './client';
import { Assignment, AssignmentSubmission } from '@/types';

// matches backend/assignments/assignments.controller.ts
// (courses/:courseId/assignments)
export const assignmentsApi = {
  getByCourse: async (courseId: string) => {
    return await apiClient.get<{ success: boolean; data: Assignment[] }>(
      `/courses/${courseId}/assignments`,
    );
  },

  getById: async (courseId: string, assignmentId: string) => {
    return await apiClient.get<{ success: boolean; data: Assignment }>(
      `/courses/${courseId}/assignments/${assignmentId}`,
    );
  },

  create: async (courseId: string, data: Partial<Assignment>) => {
    return await apiClient.post(`/courses/${courseId}/assignments`, data);
  },

  update: async (courseId: string, assignmentId: string, data: Partial<Assignment>) => {
    return await apiClient.patch(`/courses/${courseId}/assignments/${assignmentId}`, data);
  },

  delete: async (courseId: string, assignmentId: string) => {
    return await apiClient.delete(`/courses/${courseId}/assignments/${assignmentId}`);
  },

  // ─── submissions ──────────────────────────────────────────────────────

  // teacher/admin view — every student's submission for this assignment
  getSubmissions: async (courseId: string, assignmentId: string, page = 1, limit = 20) => {
    return await apiClient.get<{ success: boolean; data: any }>(
      `/courses/${courseId}/assignments/${assignmentId}/submissions?page=${page}&limit=${limit}`,
    );
  },

  // student view — just their own submission (or null if not submitted yet)
  getMySubmission: async (courseId: string, assignmentId: string) => {
    return await apiClient.get<{ success: boolean; data: AssignmentSubmission | null }>(
      `/courses/${courseId}/assignments/${assignmentId}/submissions/me`,
    );
  },

  submit: async (courseId: string, assignmentId: string, data: { fileUrl?: string; textContent?: string }) => {
    return await apiClient.post(
      `/courses/${courseId}/assignments/${assignmentId}/submissions`,
      data,
    );
  },

  // NOTE: the backend route is nested under the assignment too
  // (courses/:courseId/assignments/:assignmentId/submissions/:submissionId/grade)
  // — grading a submission still needs to know which assignment it belongs to.
  grade: async (
    courseId: string,
    assignmentId: string,
    submissionId: string,
    data: { score: number; feedback?: string },
  ) => {
    return await apiClient.patch(
      `/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/grade`,
      data,
    );
  },
};