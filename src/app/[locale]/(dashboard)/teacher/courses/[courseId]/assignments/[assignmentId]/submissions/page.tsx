"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, FileText, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useSubmissions, useGradeSubmission, useAssignment } from "@/services/assignments.service";
import { AssignmentSubmission } from "@/types";

export default function SubmissionsPage() {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const router = useRouter();

  const { data: assignment } = useAssignment(courseId, assignmentId);
  const { data, isLoading, isError } = useSubmissions(courseId, assignmentId);
  const { mutate: gradeSubmission, isPending: isGrading } = useGradeSubmission(courseId, assignmentId);

  // keyed by submissionId so each card's inputs are independent
  const [scores, setScores] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

  const submissions: AssignmentSubmission[] = data?.submissions || [];

  const handleGrade = (submissionId: string) => {
    const scoreValue = Number(scores[submissionId]);
    if (!scores[submissionId] || Number.isNaN(scoreValue)) {
      toast.error("Enter a valid score first");
      return;
    }
    gradeSubmission(
      { submissionId, data: { score: scoreValue, feedback: feedbacks[submissionId] } },
      {
        onSuccess: () => toast.success("Submission graded"),
        onError: () => toast.error("Failed to save grade — check the score is within range"),
      },
    );
  };

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
        <p className="text-red-500 font-medium">Failed to load submissions. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button
        onClick={() => router.push(`/teacher/courses/${courseId}/assignments`)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to assignments
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-black">{assignment?.title || "Submissions"}</h1>
        <p className="text-slate-500 text-sm mt-1">
          Max score: {assignment?.maxScore ?? "—"} · {submissions.length} submission
          {submissions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((submission: any) => {
            const isGraded = submission.status === "GRADED";
            return (
              <div
                key={submission.id}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold">{submission.student?.name}</p>
                    <p className="text-slate-400 text-xs">{submission.student?.email}</p>
                  </div>
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 ${
                      isGraded
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {isGraded ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {isGraded ? "Graded" : "Pending"}
                  </span>
                </div>

                {submission.textContent && (
                  <p className="text-slate-600 text-sm bg-slate-50 rounded-xl p-3 mb-3 whitespace-pre-wrap">
                    {submission.textContent}
                  </p>
                )}

                {submission.fileUrl && (
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium mb-3 hover:underline"
                  >
                    <FileText size={14} /> View submitted file <ExternalLink size={12} />
                  </a>
                )}

                <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-3 items-start mt-4">
                  <input
                    type="number"
                    min={0}
                    max={assignment?.maxScore}
                    placeholder="Score"
                    defaultValue={submission.score ?? ""}
                    onChange={(e) =>
                      setScores((prev) => ({ ...prev, [submission.id]: e.target.value }))
                    }
                    className="border border-slate-200 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Feedback (optional)"
                    defaultValue={submission.feedback ?? ""}
                    onChange={(e) =>
                      setFeedbacks((prev) => ({ ...prev, [submission.id]: e.target.value }))
                    }
                    className="border border-slate-200 rounded-lg px-3 py-2"
                  />
                  <button
                    disabled={isGrading}
                    onClick={() => handleGrade(submission.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {isGraded ? "Update grade" : "Grade"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
          <p className="text-slate-500 font-medium">No submissions yet.</p>
        </div>
      )}
    </div>
  );
}