"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Trash2, Save, ArrowLeft, Loader2, Upload, GripVertical, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { uploadApi } from "@/lib/api/upload.api";

interface Lesson {
  id?: string;
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
  isNew?: boolean;
  isUploading?: boolean;
  videoName?: string;
}

export default function LessonsPage() {
  const { courseId } = useParams() as { courseId: string };
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("moduleId");
  const router = useRouter();

  const [courseName, setCourseName] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!moduleId) return;
    const load = async () => {
      try {
        const [courseRes, modulesRes, lessonsRes] = await Promise.all([
          apiClient.get(`/courses/${courseId}`),
          apiClient.get(`/courses/${courseId}/modules`),
          apiClient.get(`/courses/${courseId}/lessons`, { params: { moduleId } }),
        ]);
        setCourseName((courseRes.data as any)?.data?.title || "Course");

        const modulesData = (modulesRes.data as any)?.data ?? modulesRes.data ?? [];
        const currentModule = Array.isArray(modulesData)
          ? modulesData.find((m: any) => m.id === moduleId)
          : null;
        setModuleName(currentModule?.title || "Module");

        const existing = (lessonsRes.data as any)?.data ?? lessonsRes.data ?? [];
        setLessons(Array.isArray(existing) ? existing : []);
      } catch {
        toast.error("Failed to load lessons");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [courseId, moduleId]);

  const addLesson = () => {
    setLessons((prev) => [
      ...prev,
      {
        title: "",
        videoUrl: "",
        duration: 0,
        order: prev.length + 1,
        isNew: true,
      },
    ]);
  };

  const updateLesson = (index: number, field: keyof Lesson, value: any) => {
    setLessons((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  };

  const removeLesson = async (index: number) => {
    const lesson = lessons[index];
    if (lesson.id) {
      try {
        await apiClient.delete(`/courses/${courseId}/lessons/${lesson.id}`);
        toast.success("Lesson deleted");
      } catch {
        toast.error("Failed to delete lesson");
        return;
      }
    }
    setLessons((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = async (index: number, file: File) => {
    updateLesson(index, "isUploading", true);
    updateLesson(index, "videoName", file.name);
    try {
      const videoData = await uploadApi.uploadCourseVideo(file);
      const url = (videoData as any)?.url ?? videoData;
      updateLesson(index, "videoUrl", url);
      updateLesson(index, "isUploading", false);
      toast.success("Video uploaded ✅");
    } catch {
      updateLesson(index, "isUploading", false);
      toast.error("Failed to upload video");
    }
  };

  const handleSave = async () => {
    const emptyTitle = lessons.some((l) => !l.title.trim());
    if (emptyTitle) {
      toast.error("All lessons must have a title");
      return;
    }
    if (!moduleId) {
      toast.error("No module selected — go back and open a module first");
      return;
    }

    setIsSaving(true);
    try {
      const newLessons = lessons.filter((l) => l.isNew);
      for (const lesson of newLessons) {
        await apiClient.post(`/courses/${courseId}/lessons`, {
          title: lesson.title,
          videoUrl: lesson.videoUrl || undefined,
          duration: lesson.duration,
          order: lesson.order,
          moduleId,
        });
      }
      toast.success("Lessons saved successfully! ✅");
      router.push(`/teacher/courses/${courseId}/modules`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save lessons");
    } finally {
      setIsSaving(false);
    }
  };

  if (!moduleId) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center space-y-4">
        <p className="text-red-400 font-bold">No module selected.</p>
        <p className="text-slate-400 text-sm">Go back to Modules and open a chapter to manage its lessons.</p>
        <button
          onClick={() => router.push(`/teacher/courses/${courseId}/modules`)}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 transition"
        >
          Back to Modules
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8 animate-in fade-in duration-700 pb-20">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            title="Go back"
            onClick={() => router.push(`/teacher/courses/${courseId}/modules`)}
            className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition"
          >
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800">Manage Lessons</h1>
            <p className="text-slate-400 font-medium">{courseName} — <span className="text-blue-600 font-bold">{moduleName}</span></p>
          </div>
        </div>
        <button
          onClick={addLesson}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black hover:bg-blue-600 transition"
        >
          <Plus size={18} /> Add Lesson
        </button>
      </div>

      {lessons.length === 0 ? (
        <div className="bg-white p-16 rounded-[2.5rem] border border-slate-100 text-center">
          <p className="text-slate-400 font-black text-xl mb-4">No lessons yet</p>
          <p className="text-slate-300 text-sm mb-6">Click "Add Lesson" to create your first lesson</p>
          <button
            onClick={addLesson}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition mx-auto"
          >
            <Plus size={18} /> Add First Lesson
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id || index}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <GripVertical size={20} className="text-slate-300" />
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black text-sm">
                  {index + 1}
                </span>
                <input
                  type="text"
                  title="Lesson title"
                  placeholder="Lesson title..."
                  value={lesson.title}
                  onChange={(e) => updateLesson(index, "title", e.target.value)}
                  className="flex-1 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                />

                {lesson.id && (
                  <button
                    title="Take attendance for this lesson"
                    onClick={() => router.push(`/teacher/courses/${courseId}/lessons/${lesson.id}/attendance`)}
                    className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
                  >
                    <ClipboardCheck size={18} />
                  </button>
                )}

                <button
                  title="Delete lesson"
                  onClick={() => removeLesson(index)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <label className="flex items-center gap-3 w-full h-16 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition px-4">
                {lesson.isUploading ? (
                  <><Loader2 size={20} className="animate-spin text-blue-500" /><span className="text-slate-400 text-sm">Uploading...</span></>
                ) : lesson.videoUrl || lesson.videoName ? (
                  <><span className="text-green-600 font-bold text-sm">✅ {lesson.videoName || "Video uploaded"}</span><span className="text-slate-400 text-xs ml-auto">Click to change</span></>
                ) : (
                  <><Upload size={20} className="text-slate-400" /><span className="text-slate-400 text-sm font-medium">Upload lesson video (optional)</span></>
                )}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoUpload(index, file);
                  }}
                />
              </label>

              <div className="flex items-center gap-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider w-24">
                  Duration (s)
                </label>
                <input
                  type="number"
                  title="Lesson duration in seconds"
                  placeholder="0"
                  value={lesson.duration}
                  onChange={(e) => updateLesson(index, "duration", Number(e.target.value))}
                  className="w-32 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 text-sm"
                  min={0}
                />
                <span className="text-slate-400 text-xs">
                  {lesson.duration > 0 ? `${Math.round(lesson.duration / 60)} min` : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {lessons.length > 0 && (
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-3 bg-green-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-xl shadow-green-200 hover:bg-green-700 transition disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Save Lessons
          </button>
        </div>
      )}
    </div>
  );
}
