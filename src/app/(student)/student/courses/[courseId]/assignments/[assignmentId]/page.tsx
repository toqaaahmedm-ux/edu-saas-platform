"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Calendar, CheckCircle2, Clock, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  useAssignment,
  useMySubmission,
  useSubmitAssignment,
} from "@/services/assignments.service";

export default function StudentAssignmentPage() {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const router = useRouter();

  const { data: assignment, isLoading: loadingAssignment } = useAssignment(courseId, assignmentId);
  const { data: submission, isLoading: loadingSubmission } = useMySubmission(courseId, assignmentId);
  const { mutate: submitAssignment, isPending: isSubmitting } = useSubmitAssignment(courseId, assignmentId);

  const [textContent, setTextContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  // pre-fill the form with a previous submission so the student can see
  // and edit what they sent before, instead of starting from a blank box
  useEffect(() => {
    if (submission) {
      setTextContent(submission.textContent || "");
      setFileUrl(submission.fileUrl || "");
    }
  }, [submission]);

  const isLoading = loadingAssignment || loadingSubmission;
  const isPastDue = assignment?.dueDate ? new Date() > new Date(assignment.dueDate) : false;
  const isGraded = submission?.status === "GRADED";

  const handleSubmit = () => {
    if (!textContent.trim() && !fileUrl.trim()) {
      toast.error("Add a file link or write an answer before submitting");
      return;
    }
    submitAssignment(
      { textContent: textContent || undefined, fileUrl: fileUrl || undefined },
      {
        onSuccess: () => toast.success(submission ? "Submission updated" : "Assignment submitted"),
        onError: (err: any) =>
          toast.error(err?.response?.data?.message || "Failed to submit assignment"),
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

  if (!assignment) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-red-200 rounded-3xl">
        <p className="text-red-500 font-medium">Assignment not found.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button
        onClick={() => router.push(`/student/courses/${courseId}`)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to course
      </button>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
        <div className="flex justify-between items-start mb-3">
          <h1 className="text-2xl font-black">{assignment.title}</h1>
          {isGraded && (
            <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
              <CheckCircle2 size={12} /> Graded
            </span>
          )}
        </div>

        {assignment.description && (
          <p className="text-slate-600 text-sm mb-4 whitespace-pre-wrap">{assignment.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>Max score: {assignment.maxScore}</span>
          {assignment.dueDate && (
            <span className={`flex items-center gap-1 ${isPastDue ? "text-red-500" : ""}`}>
              <Calendar size={12} />
              Due {new Date(assignment.dueDate).toLocaleString()}
              {isPastDue && !submission ? " (past due)" : ""}
            </span>
          )}
        </div>
      </div>

      {isGraded && (
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl mb-6">
          <p className="text-emerald-700 font-black text-lg mb-1">
            Score: {submission.score} / {assignment.maxScore}
          </p>
          {submission.feedback && (
            <p className="text-emerald-800 text-sm whitespace-pre-wrap">{submission.feedback}</p>
          )}
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="font-bold text-lg mb-4">
          {submission ? "Your submission" : "Submit your work"}
        </h2>

        {submission && !isGraded && (
          <p className="flex items-center gap-1 text-orange-600 text-xs font-medium mb-4">
            <Clock size={12} /> Submitted — waiting for the teacher to grade it. You can still
            update it below before the due date.
          </p>
        )}

        {isPastDue && !submission ? (
          <p className="text-red-500 text-sm">
            The due date for this assignment has passed and you didn't submit in time.
          </p>
        ) : isGraded ? (
          <p className="text-slate-400 text-sm">
            This assignment has already been graded and can no longer be edited.
          </p>
        ) : (
          <>
            <textarea
              className="border border-slate-200 rounded-lg px-3 py-2 w-full mb-3"
              rows={5}
              placeholder="Write your answer here…"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
            <div className="flex items-center gap-2 mb-4">
              <Upload size={16} className="text-slate-400" />
              <input
                type="text"
                className="border border-slate-200 rounded-lg px-3 py-2 flex-1"
                placeholder="Paste a file link (uploaded via your usual upload flow)"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
              />
            </div>
            <button
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? "Submitting…" : submission ? "Update submission" : "Submit assignment"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}