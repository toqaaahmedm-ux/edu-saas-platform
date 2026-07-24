"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Check, X as XIcon, Clock3, FileWarning } from "lucide-react";
import { toast } from "sonner";
import { useLessonAttendance, useMarkAttendance } from "@/services/attendance.service";
// NEW: the roster (who's actually enrolled) comes from enrollments, not
// from attendance — attendance only has rows for students who were
// already marked at least once, so it was always empty on a fresh lesson
import { useCourseEnrollments } from "@/services/enrollments.service";

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present", icon: Check, color: "emerald" },
  { value: "ABSENT", label: "Absent", icon: XIcon, color: "red" },
  { value: "LATE", label: "Late", icon: Clock3, color: "orange" },
  { value: "EXCUSED", label: "Excused", icon: FileWarning, color: "slate" },
] as const;

export default function AttendancePage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();

  // NOTE: this page expects the roster (enrolled students) to already be
  // available from the existing enrollments hook — swap this out for
  // whatever hook your enrollments.service.ts already exposes for
  // "students enrolled in this course" if the name differs.
  const { data: existingAttendance = [], isLoading: loadingAttendance } = useLessonAttendance(lessonId);
  const { data: enrollments = [], isLoading: loadingRoster } = useCourseEnrollments(courseId);
  const { mutate: markAttendance, isPending: isSaving } = useMarkAttendance(lessonId);

  const isLoading = loadingAttendance || loadingRoster;

  // the roster is the source of truth for "who shows up in this list";
  // existing attendance records just tell us their current status, if any
  const roster = enrollments.map((enrollment: any) => {
    const existing = existingAttendance.find(
      (record: any) => record.studentId === enrollment.studentId || record.studentId === enrollment.student?.id,
    );
    return {
      studentId: enrollment.studentId || enrollment.student?.id,
      student: enrollment.student,
      status: existing?.status,
    };
  });

  const [statuses, setStatuses] = useState<Record<string, string>>({});

  // pre-fill from whatever was already marked for this lesson
  useEffect(() => {
    if (roster.length) {
      const map: Record<string, string> = {};
      roster.forEach((r: any) => {
        if (r.status) map[r.studentId] = r.status;
      });
      setStatuses((prev) => ({ ...map, ...prev }));
    }
  }, [existingAttendance, enrollments]);

  const handleSave = () => {
    const records = Object.entries(statuses).map(([studentId, status]) => ({
      studentId,
      status,
    }));
    if (records.length === 0) {
      toast.error("Mark at least one student first");
      return;
    }
    markAttendance(records, {
      onSuccess: () => toast.success("Attendance saved"),
      onError: () => toast.error("Failed to save attendance"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-3xl font-black mb-2">Attendance</h1>
      <p className="text-slate-500 text-sm mb-8">
        Mark each student, then save once — this updates or creates the
        record for all of them together.
      </p>

      {roster.length > 0 ? (
        <div className="space-y-3">
          {roster.map((entry: any) => (
            <div
              key={entry.studentId}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
            >
              <p className="font-medium">{entry.student?.name || entry.studentId}</p>
              <div className="flex gap-1">
                {STATUS_OPTIONS.map(({ value, label, icon: Icon, color }) => {
                  const isActive = statuses[entry.studentId] === value;
                  return (
                    <button
                      key={value}
                      onClick={() =>
                        setStatuses((prev) => ({ ...prev, [entry.studentId]: value }))
                      }
                      title={label}
                      className={`p-2 rounded-lg transition ${
                        isActive
                          ? `bg-${color}-600 text-white`
                          : `bg-${color}-50 text-${color}-600 hover:bg-${color}-100`
                      }`}
                    >
                      <Icon size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl">
          <p className="text-slate-500 font-medium">
            No students enrolled in this course yet.
          </p>
        </div>
      )}

      <button
        disabled={isSaving}
        onClick={handleSave}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {isSaving ? "Saving…" : "Save attendance"}
      </button>
    </div>
  );
}