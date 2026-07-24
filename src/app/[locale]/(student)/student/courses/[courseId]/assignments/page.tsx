"use client";

import { useParams, useRouter } from "next/navigation";
import { Loader2, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useAssignments } from "@/services/assignments.service";

export default function StudentAssignmentsPage() {
//   const { courseId } = useParams<{ courseId: string }>();
const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  const { data: assignments = [], isLoading, isError } = useAssignments(courseId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-red-200 rounded-3xl">
        <p className="text-red-500 font-medium">Failed to load assignments.</p>
      </div>
    );
  }

  const published = assignments.filter((a: any) => a.isPublished);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-8">Assignments</h1>

      {published.length > 0 ? (
        <div className="space-y-3">
          {published.map((assignment: any) => {
            const isPastDue = assignment.dueDate ? new Date() > new Date(assignment.dueDate) : false;
            return (
              <button
                key={assignment.id}
                onClick={() =>
                  router.push(`/student/courses/${courseId}/assignments/${assignment.id}`)
                }
                className="w-full text-left bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 text-blue-600 rounded-xl p-2">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="font-bold">{assignment.title}</p>
                    {assignment.dueDate && (
                      <p className={`text-xs mt-1 ${isPastDue ? "text-red-500" : "text-slate-400"}`}>
                        Due {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {isPastDue ? (
                  <span className="flex items-center gap-1 text-xs font-black text-red-600 bg-red-50 px-3 py-1 rounded-full">
                    <AlertCircle size={12} /> Past due
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    <Clock size={12} /> Open
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
          <p className="text-slate-500 font-medium">No assignments published yet.</p>
        </div>
      )}
    </div>
  );
}