
"use client";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { ClipboardCheck, Loader2, Save, Check, X, Clock, FileWarning } from "lucide-react";
import { toast } from "sonner";
import { useModules } from "@/services/modules.service";
import { useCourseEnrollments } from "@/services/enrollments.service";
import { useLessonAttendance, useMarkAttendance } from "@/services/attendance.service";

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present", icon: Check, color: "emerald" },
  { value: "ABSENT", label: "Absent", icon: X, color: "red" },
  { value: "LATE", label: "Late", icon: Clock, color: "amber" },
  { value: "EXCUSED", label: "Excused", icon: FileWarning, color: "blue" },
];

export default function AttendancePage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const { data: modules = [], isLoading: modulesLoading } = useModules(courseId);
  const { data: enrollments = [], isLoading: studentsLoading } = useCourseEnrollments(courseId);

  const lessons = useMemo(
    () => modules.flatMap((m: any) => (m.lessons || []).map((l: any) => ({ ...l, moduleTitle: m.title }))),
    [modules],
  );

  const [selectedLessonId, setSelectedLessonId] = useState("");
  const { data: existingAttendance = [] } = useLessonAttendance(selectedLessonId);
  const { mutate: markAttendance, isPending: saving } = useMarkAttendance(selectedLessonId);

  const [statuses, setStatuses] = useState<Record<string, string>>({});

  const getStatus = (studentId: string) => {
    if (statuses[studentId]) return statuses[studentId];
    const existing = existingAttendance.find((a: any) => a.studentId === studentId);
    return existing?.status || "PRESENT";
  };

  const setStatus = (studentId: string, status: string) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    const students = enrollments.map((e: any) => e.student || e);
    const records = students.map((s: any) => ({
      studentId: s.id,
      status: getStatus(s.id),
    }));

    markAttendance(records, {
      onSuccess: () => {
        toast.success("Attendance saved successfully.");
        setStatuses({});
      },
      onError: () => toast.error("Failed to save attendance."),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left">
      <div>
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <ClipboardCheck className="text-blue-600" size={32} />
          Attendance
        </h2>
        <p className="text-slate-400 font-medium mt-1">
          Take attendance for a lesson.
        </p>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Select Lesson</label>
          {modulesLoading ? (
            <div className="flex items-center gap-2 mt-2 text-slate-400">
              <Loader2 className="animate-spin" size={16} /> Loading lessons...
            </div>
          ) : lessons.length === 0 ? (
            <p className="text-slate-400 text-sm mt-2 italic">
              No lessons yet. Add lessons to a module first.
            </p>
          ) : (
            <select
              value={selectedLessonId}
              onChange={(e) => { setSelectedLessonId(e.target.value); setStatuses({}); }}
              className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Select a lesson</option>
              {lessons.map((l: any) => (
                <option key={l.id} value={l.id}>
                  {l.moduleTitle} — {l.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedLessonId && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            {studentsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : enrollments.length === 0 ? (
              <p className="text-slate-400 text-center py-10 font-bold italic">
                No students enrolled in this course yet.
              </p>
            ) : (
              <>
                {enrollments.map((e: any) => {
                  const student = e.student || e;
                  const current = getStatus(student.id);
                  return (
                    <div
                      key={student.id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black uppercase text-sm">
                          {student.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm leading-none">{student.name}</p>
                          <p className="text-xs text-slate-400 mt-1">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {STATUS_OPTIONS.map((opt) => {
                          const Icon = opt.icon;
                          const active = current === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => setStatus(student.id, opt.value)}
                              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                active
                                  ? `bg-${opt.color}-600 text-white`
                                  : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-100"
                              }`}
                              style={active ? { backgroundColor: opt.color === "emerald" ? "#059669" : opt.color === "red" ? "#dc2626" : opt.color === "amber" ? "#d97706" : "#2563eb", color: "white" } : {}}
                            >
                              <Icon size={14} /> {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 mt-4"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Save Attendance
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}