import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentsApi } from "@/lib/api/assignments.api";
import { Assignment, AssignmentSubmission } from "@/types";

export const assignmentKeys = {
  byCourse: (courseId: string) => ["assignments", courseId] as const,
  byId: (courseId: string, assignmentId: string) => ["assignments", courseId, assignmentId] as const,
  submissions: (courseId: string, assignmentId: string) =>
    ["assignment-submissions", courseId, assignmentId] as const,
  mySubmission: (courseId: string, assignmentId: string) =>
    ["my-submission", courseId, assignmentId] as const,
};

export const useAssignments = (courseId: string) => {
  return useQuery({
    queryKey: assignmentKeys.byCourse(courseId),
    queryFn: async () => {
      const response = await assignmentsApi.getByCourse(courseId);
      return ((response.data as any)?.data || []) as Assignment[];
    },
    enabled: !!courseId,
    staleTime: 0,
  });
};

export const useAssignment = (courseId: string, assignmentId: string) => {
  return useQuery({
    queryKey: assignmentKeys.byId(courseId, assignmentId),
    queryFn: async () => {
      const response = await assignmentsApi.getById(courseId, assignmentId);
      return (response.data as any)?.data as Assignment;
    },
    enabled: !!courseId && !!assignmentId,
  });
};

export const useCreateAssignment = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Assignment>) => assignmentsApi.create(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.byCourse(courseId) });
    },
  });
};

export const useUpdateAssignment = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: Partial<Assignment> }) =>
      assignmentsApi.update(courseId, assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.byCourse(courseId) });
    },
  });
};

export const useDeleteAssignment = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) => assignmentsApi.delete(courseId, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.byCourse(courseId) });
    },
  });
};

// ─── submissions ────────────────────────────────────────────────────────

// teacher/admin: every student's submission for one assignment
export const useSubmissions = (courseId: string, assignmentId: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...assignmentKeys.submissions(courseId, assignmentId), page, limit],
    queryFn: async () => {
      const response = await assignmentsApi.getSubmissions(courseId, assignmentId, page, limit);
      return (response.data as any)?.data;
    },
    enabled: !!courseId && !!assignmentId,
    staleTime: 0,
  });
};

// student: their own submission, or null if they haven't submitted yet
export const useMySubmission = (courseId: string, assignmentId: string) => {
  return useQuery({
    queryKey: assignmentKeys.mySubmission(courseId, assignmentId),
    queryFn: async () => {
      const response = await assignmentsApi.getMySubmission(courseId, assignmentId);
      return (response.data as any)?.data as AssignmentSubmission | null;
    },
    enabled: !!courseId && !!assignmentId,
  });
};

export const useSubmitAssignment = (courseId: string, assignmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { fileUrl?: string; textContent?: string }) =>
      assignmentsApi.submit(courseId, assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.mySubmission(courseId, assignmentId) });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.submissions(courseId, assignmentId) });
    },
  });
};

export const useGradeSubmission = (courseId: string, assignmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      data,
    }: {
      submissionId: string;
      data: { score: number; feedback?: string };
    }) => assignmentsApi.grade(courseId, assignmentId, submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.submissions(courseId, assignmentId) });
    },
  });
};