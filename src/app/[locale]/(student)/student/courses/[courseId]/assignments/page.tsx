"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  Loader2,
  Upload,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { uploadApi } from "@/lib/api/upload.api";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  maxScore: number;
  isPublished: boolean;
  allowFileUpload: boolean;
}

interface Submission {
  id: string;
  fileUrl: string | null;
  textContent: string | null;
  status: "DRAFT" | "SUBMITTED" | "GRADED" | "RETURNED";
  score: number | null;
  feedback: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
}

function getDueState(dueDate: string | null) {
  if (!dueDate) return { label: null, isPast: false };
  const due = new Date(dueDate);
  const isPast = due.getTime() < Date.now();
  return {
    label: due.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    isPast,
  };
}

function SubmissionPanel({
  courseId,
  assignment,
  submission,
  onSubmitted,
}: {
  courseId: string;
  assignment: Assignment;
  submission: Submission | null;
  onSubmitted: () => void;
}) {
  const [textContent, setTextContent] = useState(submission?.textContent ?? "");
  const [fileUrl, setFileUrl] = useState(submission?.fileUrl ?? "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { label: dueLabel, isPast } = getDueState(assignment.dueDate);
  const isGraded = submission?.status === "GRADED";
  const canEdit = !isGraded && (!isPast || !!submission);

  const handleFileChange = async (file: File) => {
    setIsUploading(true);
    setFileName(file.name);
    try {
      const url = await uploadApi.uploadDocument(file);
      setFileUrl(url);
      toast.success("File uploaded ✅");
    } catch {
      toast.error("Failed to upload file");
      setFileName(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!textContent.trim() && !fileUrl) {
      toast.error("Add a text answer or attach a file before submitting");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post(`/courses/${courseId}/assignments/${assignment.id}/submissions`, {
        textContent: textContent.trim() || undefined,
        fileUrl: fileUrl || undefined,
      });
      toast.success("Assignment submitted! 🎉");
      onSubmitted();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isGraded) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <Award className="text-emerald-600 shrink-0" size={24} />
          <div>
            <p className="font-black text-emerald-700">
              Graded: {submission!.score}/{assignment.maxScore}
            </p>
            {submission!.feedback && (
              <p className="text-sm text-emerald-600 mt-1">{submission!.feedback}</p>
            )}
          </div>
        </div>
        {submission!.textContent && (
          <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Your answer</p>
            {submission!.textContent}
          </div>
        )}
        {submission!.fileUrl && (
          <a
            href={submission!.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline"
          >
            <FileText size={16} /> View submitted file
          </a>
        )}
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-100 rounded-2xl">
        <AlertCircle className="text-red-500 shrink-0" size={24} />
        <p className="font-bold text-red-600 text-sm">
          The due date has passed and no submission was made.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submission && submission.status === "SUBMITTED" && (
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
          <CheckCircle2 size={16} /> Submitted — you can still update it until it's graded.
        </div>
      )}

      <textarea
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        placeholder="Write your answer here..."
        rows={5}
        className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none font-medium text-sm text-slate-700 resize-none"
      />

      {assignment.allowFileUpload && (
        <label className="flex items-center gap-3 w-full h-16 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition px-4">
          {isUploading ? (
            <>
              <Loader2 size={20} className="animate-spin text-blue-500" />
              <span className="text-slate-400 text-sm">Uploading...</span>
            </>
          ) : fileUrl || fileName ? (
            <>
              <span className="text-green-600 font-bold text-sm">✅ {fileName || "File attached"}</span>
              <span className="text-slate-400 text-xs ml-auto">Click to change</span>
            </>
          ) : (
            <>
              <Upload size={20} className="text-slate-400" />
              <span className="text-slate-400 text-sm font-medium">Attach a file (optional)</span>
            </>
          )}
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
          />
        </label>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || isUploading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
        {submission ? "Update Submission" : "Submit Assignment"}
      </button>
    </div>
  );
}

function AssignmentCard({ courseId, assignment }: { courseId: string; assignment: Assignment }) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const loadSubmission = async () => {
    try {
      const res = await apiClient.get(`/courses/${courseId}/assignments/${assignment.id}/submissions/me`);
      const data = (res.data as any)?.data ?? res.data ?? null;
      setSubmission(data);
    } catch {
      setSubmission(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment.id]);

  const { label: dueLabel, isPast } = getDueState(assignment.dueDate);
  const statusBadge = () => {
    if (submission?.status === "GRADED") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full">
          <Award size={12} /> Graded — {submission.score}/{assignment.maxScore}
        </span>
      );
    }
    if (submission?.status === "SUBMITTED") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full">
          <CheckCircle2 size={12} /> Submitted
        </span>
      );
    }
    if (isPast) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1.5 bg-red-100 text-red-600 rounded-full">
          <AlertCircle size={12} /> Past due
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full">
        <Clock size={12} /> Not submitted
      </span>
    );
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div>
          <h3 className="text-lg font-black text-slate-800 mb-1">{assignment.title}</h3>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
            {dueLabel && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> Due {dueLabel}
              </span>
            )}
            <span>Max score: {assignment.maxScore}</span>
          </div>
        </div>
        {isLoading ? <Loader2 className="animate-spin text-slate-300" size={20} /> : statusBadge()}
      </button>

      {isOpen && (
        <div className="p-6 pt-0 border-t border-slate-50 space-y-4">
          {assignment.description && (
            <p className="text-sm text-slate-500 leading-relaxed">{assignment.description}</p>
          )}
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-blue-600" size={24} />
            </div>
          ) : (
            <SubmissionPanel
              courseId={courseId}
              assignment={assignment}
              submission={submission}
              onSubmitted={loadSubmission}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function StudentAssignmentsPage() {
  const { courseId } = useParams() as { courseId: string };
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courseName, setCourseName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const [courseRes, assignmentsRes] = await Promise.all([
          apiClient.get(`/courses/${courseId}`),
          apiClient.get(`/courses/${courseId}/assignments`),
        ]);
        setCourseName((courseRes.data as any)?.data?.title || "Course");
        const data = (assignmentsRes.data as any)?.data ?? assignmentsRes.data ?? [];
        const published = (Array.isArray(data) ? data : []).filter((a: Assignment) => a.isPublished);
        setAssignments(published);
      } catch (err: any) {
        setLoadError(
          err?.response?.status === 403
            ? "You must be enrolled in this course to view its assignments."
            : "Couldn't load assignments right now."
        );
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [courseId]);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center gap-4">
        <Link
          href={`/student/courses/${courseId}`}
          className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition"
        >
          <ChevronLeft size={20} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <ClipboardList size={26} className="text-indigo-500" /> Assignments
          </h1>
          <p className="text-slate-400 font-medium">{courseName}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : loadError ? (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 text-center">
          <AlertCircle className="mx-auto text-red-400 mb-3" size={32} />
          <p className="text-red-500 font-bold">{loadError}</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white p-16 rounded-[2.5rem] border border-slate-100 text-center">
          <ClipboardList className="mx-auto text-slate-300 mb-4" size={40} />
          <p className="text-slate-400 font-black text-lg">No assignments yet</p>
          <p className="text-slate-300 text-sm mt-2">Check back later — your instructor hasn't published any assignments.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <AssignmentCard key={a.id} courseId={courseId} assignment={a} />
          ))}
        </div>
      )}
    </div>
  );
}