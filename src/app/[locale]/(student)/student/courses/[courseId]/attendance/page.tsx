"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock3,
  FileWarning,
  AlertTriangle,
  Loader2,
  Upload,
  X,
  Hourglass,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { uploadApi } from "@/lib/api/upload.api";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface AttendanceRecord {
  id: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  note: string | null;
  markedAt: string;
  excuseStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
  excuseReason: string | null;
  excuseFileUrl: string | null;
  lesson: {
    id: string;
    title: string;
    order: number;
  };
}

interface AttendanceSummary {
  records: AttendanceRecord[];
  totalLessons: number;
  present: number;
  attendanceRate: number;
}

const AT_RISK_THRESHOLD = 75;

function statusMeta(status: AttendanceRecord["status"], t: (k: string) => string) {
  switch (status) {
    case "PRESENT":
      return { label: t("statusPresent"), icon: <CheckCircle2 size={16} />, className: "bg-emerald-100 text-emerald-700" };
    case "ABSENT":
      return { label: t("statusAbsent"), icon: <XCircle size={16} />, className: "bg-red-100 text-red-600" };
    case "LATE":
      return { label: t("statusLate"), icon: <Clock3 size={16} />, className: "bg-amber-100 text-amber-700" };
    case "EXCUSED":
      return { label: t("statusExcused"), icon: <FileWarning size={16} />, className: "bg-blue-100 text-blue-700" };
  }
}

export default function StudentAttendancePage() {
  const { courseId } = useParams() as { courseId: string };
  const t = useTranslations("teacherAttendance"); // reusing shared status labels
  const tE = useTranslations("studentAttendanceExcuse");
  const [courseName, setCourseName] = useState("");
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // excuse request modal state
  const [excuseTarget, setExcuseTarget] = useState<AttendanceRecord | null>(null);
  const [excuseReason, setExcuseReason] = useState("");
  const [excuseFile, setExcuseFile] = useState<{ url: string; name: string } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSubmittingExcuse, setIsSubmittingExcuse] = useState(false);

  const load = async () => {
    if (!courseId) return;
    try {
      setIsLoading(true);
      setLoadError(null);
      const [courseRes, attendanceRes] = await Promise.all([
        apiClient.get(`/courses/${courseId}`),
        apiClient.get(`/courses/${courseId}/attendance/me`),
      ]);
      setCourseName((courseRes.data as any)?.data?.title || tE("courseDefault"));
      const data = (attendanceRes.data as any)?.data ?? attendanceRes.data ?? null;
      setSummary(data);
    } catch (err: any) {
      setLoadError(
        err?.response?.status === 403
          ? tE("mustBeEnrolled")
          : tE("loadError")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const isAtRisk = summary && summary.totalLessons > 0 && summary.attendanceRate < AT_RISK_THRESHOLD;

  const openExcuseModal = (record: AttendanceRecord) => {
    setExcuseTarget(record);
    setExcuseReason("");
    setExcuseFile(null);
  };

  const closeExcuseModal = () => {
    setExcuseTarget(null);
    setExcuseReason("");
    setExcuseFile(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingFile(true);
      const doc = await uploadApi.uploadDocument(file);
      const url = (doc as any)?.url ?? doc;
      setExcuseFile({ url, name: file.name });
    } catch {
      toast.error(tE("fileUploadFailed"));
    } finally {
      setIsUploadingFile(false);
    }
  };

  const submitExcuse = async () => {
    if (!excuseTarget || !excuseReason.trim()) {
      toast.error(tE("reasonRequired"));
      return;
    }
    try {
      setIsSubmittingExcuse(true);
      await apiClient.post(`/attendance/${excuseTarget.id}/excuse`, {
        reason: excuseReason.trim(),
        fileUrl: excuseFile?.url,
      });
      toast.success(tE("excuseSubmitted"));
      closeExcuseModal();
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || tE("excuseSubmitFailed"));
    } finally {
      setIsSubmittingExcuse(false);
    }
  };

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
            <CalendarCheck size={26} className="text-emerald-500" /> {tE("attendance")}
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
          <AlertTriangle className="mx-auto text-red-400 mb-3" size={32} />
          <p className="text-red-500 font-bold">{loadError}</p>
        </div>
      ) : !summary || summary.totalLessons === 0 ? (
        <div className="bg-white p-16 rounded-[2.5rem] border border-slate-100 text-center">
          <CalendarCheck className="mx-auto text-slate-300 mb-4" size={40} />
          <p className="text-slate-400 font-black text-lg">{tE("noAttendanceYet")}</p>
          <p className="text-slate-300 text-sm mt-2">{tE("noAttendanceHint")}</p>
        </div>
      ) : (
        <>
          {isAtRisk && (
            <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-100 rounded-2xl">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={22} />
              <div>
                <p className="font-black text-red-700 text-sm">{tE("belowThreshold", { threshold: AT_RISK_THRESHOLD })}</p>
                <p className="text-red-500 text-sm mt-1">
                  {tE("belowThresholdHint", { rate: summary.attendanceRate })}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-8">
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-28 h-28 -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke={isAtRisk ? "#ef4444" : "#10b981"}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - summary.attendanceRate / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-slate-800">{summary.attendanceRate}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-500 font-medium">
                  {tE("presentOutOf", { present: summary.present, total: summary.totalLessons })}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {(["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const).map((s) => {
                    const count = summary.records.filter((r) => r.status === s).length;
                    if (count === 0) return null;
                    const meta = statusMeta(s, t);
                    return (
                      <span key={s} className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${meta.className}`}>
                        {meta.icon} {count} {meta.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6">{tE("lessonByLesson")}</h3>
            <div className="space-y-3">
              {summary.records.map((record) => {
                const meta = statusMeta(record.status, t);
                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100"
                  >
                    <div>
                      <p className="font-black text-slate-700 text-sm">{record.lesson.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                        {new Date(record.markedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      {record.note && (
                        <p className="text-xs text-slate-400 italic mt-1">{record.note}</p>
                      )}
                      {record.excuseStatus === "PENDING" && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 mt-1">
                          <Hourglass size={12} /> {tE("excusePending")}
                        </span>
                      )}
                      {record.excuseStatus === "REJECTED" && (
                        <span className="text-[10px] font-black text-red-500 mt-1 block">
                          {tE("excuseRejected")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {record.status === "ABSENT" && !record.excuseStatus && (
                        <button
                          onClick={() => openExcuseModal(record)}
                          className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase px-3 py-1.5 border border-blue-200 rounded-full transition-colors"
                        >
                          {tE("requestExcuse")}
                        </button>
                      )}
                      {record.status === "ABSENT" && record.excuseStatus === "REJECTED" && (
                        <button
                          onClick={() => openExcuseModal(record)}
                          className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase px-3 py-1.5 border border-blue-200 rounded-full transition-colors"
                        >
                          {tE("resubmitExcuse")}
                        </button>
                      )}
                      <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${meta.className}`}>
                        {meta.icon} {meta.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {excuseTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
            <button
              onClick={closeExcuseModal}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-black text-slate-800 mb-2">{tE("requestExcuseTitle")}</h3>
            <p className="text-sm text-slate-400 mb-6">{excuseTarget.lesson.title}</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{tE("reasonLabel")}</label>
                <textarea
                  value={excuseReason}
                  onChange={(e) => setExcuseReason(e.target.value)}
                  rows={4}
                  placeholder={tE("reasonPlaceholder")}
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{tE("attachmentLabel")}</label>
                {excuseFile ? (
                  <div className="mt-1 flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <span className="text-xs font-bold text-emerald-700 truncate">{excuseFile.name}</span>
                    <button onClick={() => setExcuseFile(null)} className="text-emerald-500 hover:text-red-500">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="mt-1 flex items-center justify-center gap-2 w-full h-14 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                    {isUploadingFile ? (
                      <Loader2 size={18} className="animate-spin text-blue-500" />
                    ) : (
                      <>
                        <Upload size={16} className="text-slate-400" />
                        <span className="text-slate-400 text-xs font-medium">{tE("attachFile")}</span>
                      </>
                    )}
                    <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={handleFileUpload} />
                  </label>
                )}
              </div>

              <button
                onClick={submitExcuse}
                disabled={isSubmittingExcuse || !excuseReason.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 mt-2"
              >
                {isSubmittingExcuse ? <Loader2 className="animate-spin" size={18} /> : null}
                {tE("submitExcuse")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
