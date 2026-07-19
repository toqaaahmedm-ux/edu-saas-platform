"use client";

import { useParams } from "next/navigation";
import { Loader2, Award, TrendingUp } from "lucide-react";
import { useMyGrade } from "@/services/grades.service";

export default function StudentGradePage() {
//   const { courseId } = useParams<{ courseId: string }>();
const { courseId } = useParams<{ courseId: string }>();
  const { data: grade, isLoading } = useMyGrade(courseId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!grade) {
    return (
      <div className="p-8 max-w-md mx-auto text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
        <Award size={32} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">
          No grade yet — this updates automatically once your teacher grades your work.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-black mb-8 text-center">Your Grade</h1>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 text-blue-700 text-3xl font-black mb-4">
          {grade.letterGrade || "—"}
        </div>
        <p className="text-4xl font-black text-slate-800 mb-1">{grade.score}%</p>
        {grade.gpa != null && (
          <p className="flex items-center justify-center gap-1 text-slate-400 text-sm">
            <TrendingUp size={14} /> GPA: {grade.gpa}
          </p>
        )}
        {grade.notes && (
          <p className="mt-4 text-slate-600 text-sm bg-slate-50 rounded-xl p-3 whitespace-pre-wrap">
            {grade.notes}
          </p>
        )}
      </div>
    </div>
  );
}