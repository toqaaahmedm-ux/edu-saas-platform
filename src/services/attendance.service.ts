import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api/attendance.api";

export const attendanceKeys = {
  byLesson: (lessonId: string) => ["attendance", "lesson", lessonId] as const,
  courseSummary: (courseId: string, studentId?: string) =>
    ["attendance", "summary", courseId, studentId || "me"] as const,
};

export const useLessonAttendance = (lessonId: string) => {
  return useQuery({
    queryKey: attendanceKeys.byLesson(lessonId),
    queryFn: async () => {
      const response = await attendanceApi.getByLesson(lessonId);
      return (response.data as any)?.data || [];
    },
    enabled: !!lessonId,
    staleTime: 0,
  });
};

export const useMarkAttendance = (lessonId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (records: { studentId: string; status: string; note?: string }[]) =>
      attendanceApi.markBulk(lessonId, records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.byLesson(lessonId) });
    },
  });
};

export const useMyAttendanceSummary = (courseId: string) => {
  return useQuery({
    queryKey: attendanceKeys.courseSummary(courseId),
    queryFn: async () => {
      const response = await attendanceApi.getMySummary(courseId);
      return (response.data as any)?.data;
    },
    enabled: !!courseId,
  });
};

export const useStudentAttendanceSummary = (courseId: string, studentId: string) => {
  return useQuery({
    queryKey: attendanceKeys.courseSummary(courseId, studentId),
    queryFn: async () => {
      const response = await attendanceApi.getStudentSummary(courseId, studentId);
      return (response.data as any)?.data;
    },
    enabled: !!courseId && !!studentId,
  });
};