"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, MessageCircle, FileText, Play, VideoOff, Loader2, AlertTriangle, PartyPopper, Award, X, Star } from "lucide-react";
import { coursesApi, ModuleWithLessons, LessonWithProgress } from "@/lib/api/courses.api";
import { apiClient } from "@/lib/api/client";
import { Course } from "@/types";
import { toast } from "sonner";

function CelebrationModal({ courseTitle, onClose }: { courseTitle: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] max-w-md w-full p-10 text-center relative shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-xl transition"
        >
          <X size={20} />
        </button>

        <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-emerald-100 rounded-full mx-auto flex items-center justify-center mb-6 animate-bounce">
          <PartyPopper className="text-amber-500" size={44} />
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-3">
          Course Completed! 🎉
        </h2>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
          You've finished every lesson in <span className="font-black text-slate-700">{courseTitle}</span>.
          Your certificate is on its way — nice work!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/student/certificates"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            <Award size={20} /> View Certificates
          </Link>
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all"
          >
            Keep Browsing
          </button>
        </div>
      </div>
    </div>
  );
}

// Task #6: rating widget shown once the student has completed the course.
// Loads any existing rating so the student sees their own stars pre-filled,
// and lets them submit or update it (backend does an upsert either way).
function CourseRatingCard({ courseId }: { courseId: string }) {
  const [value, setValue] = useState(0);
  const [hoverValue, setHoverValue] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [average, setAverage] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await apiClient.get(`/courses/${courseId}/ratings`);
        const data = (res.data as any)?.data ?? res.data ?? {};
        if (cancelled) return;
        setAverage(typeof data.average === "number" ? data.average : null);
        setCount(data.count ?? 0);
      } catch {
        // non-fatal — just show the form without stats
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const handleSubmit = async () => {
    if (value < 1) {
      toast.error("Pick a star rating before submitting");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post(`/courses/${courseId}/ratings`, {
        value,
        comment: comment.trim() || undefined,
      });
      toast.success("Thanks for rating this course! ⭐");
      setHasRated(true);
      const res = await apiClient.get(`/courses/${courseId}/ratings`);
      const data = (res.data as any)?.data ?? res.data ?? {};
      setAverage(typeof data.average === "number" ? data.average : null);
      setCount(data.count ?? 0);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't submit your rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-800">Rate this course</h3>
        {!isLoading && average !== null && count > 0 && (
          <span className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full">
            <Star size={14} fill="currentColor" /> {average} ({count})
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            className="transition-transform active:scale-90"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              size={32}
              className={(hoverValue || value) >= star ? "text-amber-400" : "text-slate-200"}
              fill={(hoverValue || value) >= star ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional: share your thoughts about this course..."
        rows={3}
        className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none font-medium text-sm text-slate-700 resize-none"
      />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-amber-400 text-white py-4 rounded-2xl font-black hover:bg-amber-500 transition shadow-lg disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Star size={18} fill="currentColor" />}
        {hasRated ? "Update Rating" : "Submit Rating"}
      </button>
    </div>
  );
}

export default function CourseContentPage() {
  const params = useParams();
  const id = params?.courseId as string;
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const [courseRes, modulesRes] = await Promise.all([
        coursesApi.getById(id),
        coursesApi.getModules(id),
      ]);
      const courseData = courseRes.data?.data || null;
      if (!courseData) {
        setLoadError("Course data was empty.");
      }
      setCourse(courseData);

      const modulesData = (modulesRes.data as any)?.data ?? modulesRes.data ?? [];
      setModules(Array.isArray(modulesData) ? modulesData : []);

      if (Array.isArray(modulesData) && modulesData.length > 0) {
        const firstModule = modulesData[0];
        if (firstModule.lessons?.length > 0) {
          setCurrentLessonId((prev) => prev ?? firstModule.lessons[0].id);
        }
      }
    } catch (err: any) {
      console.error("Failed to load course:", err);
      setCourse(null);
      setLoadError(
        err?.response?.status === 404
          ? "This course could not be found."
          : "We couldn't load this course right now. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const allLessons: LessonWithProgress[] = modules.flatMap((m) => m.lessons ?? []);
  const currentLesson = allLessons.find((l) => l.id === currentLessonId) ?? allLessons[0] ?? null;
  const completedCount = allLessons.filter((l) => l.isCompleted).length;
  const progress = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  const handleComplete = async () => {
    if (!currentLesson || currentLesson.isCompleted) return;
    setIsCompleting(true);
    try {
      const res = await coursesApi.completeLesson(id, currentLesson.id);
      const result = (res.data as any) ?? {};
      toast.success("Lesson marked as completed! Keep going 🚀");
      await fetchAll();
      // Sprint 2 / Task #9: celebrate when the whole course just crossed
      // 100% — completeLesson already tells us this directly, no need for
      // a separate "enrollment complete" call or a second round-trip.
      if (result.courseCompleted) {
        setShowCelebration(true);
      }
    } catch (err) {
      console.error("Failed to mark lesson complete:", err);
      toast.error("Couldn't save your progress. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-10 text-center space-y-4">
        <AlertTriangle className="mx-auto text-red-400" size={40} />
        <p className="font-bold text-red-500">{loadError || "Course not found."}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  const hasValidVideo = !!currentLesson?.videoUrl && currentLesson.videoUrl.trim() !== "";
  const embedUrl = currentLesson?.videoUrl
    ?.replace("watch?v=", "embed/")
    .replace("youtu.be/", "www.youtube.com/embed/");

  const instructorName =
    typeof course.instructor === "string"
      ? course.instructor
      : (course.instructor as any)?.name || "Unknown instructor";

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 text-left animate-in fade-in duration-700 pb-20">

      {showCelebration && (
        <CelebrationModal courseTitle={course.title} onClose={() => setShowCelebration(false)} />
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{course.title}</h1>
          <p className="text-slate-500 font-medium italic">
            Instructor: <span className="text-blue-600 font-black">{instructorName}</span>
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-black text-slate-400">{progress}% Complete</span>
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 transition-all shadow-lg active:scale-95 z-50 relative cursor-pointer"
        >
          <ChevronLeft size={20} /> Back to Library
        </button>
      </div>

      {allLessons.length === 0 ? (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-sm text-center space-y-3">
          <VideoOff className="mx-auto text-slate-300" size={40} />
          <p className="text-slate-400 font-bold">No lessons published for this course yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-slate-950 rounded-[3rem] border-[12px] border-white shadow-2xl overflow-hidden">
              {hasValidVideo ? (
                <iframe
                  src={embedUrl}
                  title={currentLesson?.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                  <VideoOff size={48} />
                  <p className="font-bold text-lg">No video available for this lesson</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm gap-4">
              <div className="flex gap-8">
                <button
                  disabled
                  title="Coming soon"
                  className="flex items-center gap-2 font-black text-slate-300 cursor-not-allowed text-[10px] uppercase tracking-[0.2em] relative group/tooltip"
                >
                  <MessageCircle size={20} /> Discussion
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Coming Soon
                  </span>
                </button>
                <button
                  disabled
                  title="Coming soon"
                  className="flex items-center gap-2 font-black text-slate-300 cursor-not-allowed text-[10px] uppercase tracking-[0.2em] relative group/tooltip"
                >
                  <FileText size={20} /> Resources
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Coming Soon
                  </span>
                </button>
                <button
                  onClick={() => router.push(`/student/quizzes?courseId=${id}`)}
                  className="flex items-center gap-2 font-black text-slate-400 hover:text-purple-600 transition-colors text-[10px] uppercase tracking-[0.2em]"
                >
                  <CheckCircle2 size={20} /> Take Quiz
                </button>
              </div>
              <button
                onClick={handleComplete}
                disabled={!currentLesson || currentLesson.isCompleted || isCompleting}
                className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${currentLesson?.isCompleted
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white"
                  }`}
              >
                <CheckCircle2 size={22} />
                {currentLesson?.isCompleted ? "COMPLETED ✓" : isCompleting ? "SAVING..." : "MARK AS DONE"}
              </button>
            </div>

            {/* Task #6: only show the rating card once the course is 100% complete */}
            {progress === 100 && <CourseRatingCard courseId={id} />}
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-lg h-fit sticky top-28">
            <h3 className="text-xl font-black text-slate-800 mb-8 border-b pb-4 flex items-center justify-between">
              Curriculum
              <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
                {completedCount}/{allLessons.length}
              </span>
            </h3>
            <div className="space-y-6">
              {modules.map((module) => (
                <div key={module.id}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{module.title}</p>
                  <div className="space-y-3">
                    {(module.lessons ?? []).map((lesson) => {
                      const isActive = currentLessonId === lesson.id;
                      const isDone = lesson.isCompleted;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLessonId(lesson.id)}
                          className={`w-full p-4 rounded-[1.5rem] border-2 flex justify-between items-center transition-all ${isActive
                              ? "border-blue-600 bg-blue-50/30 shadow-md"
                              : "border-slate-100 hover:border-slate-200"
                            }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className={`font-black text-sm ${isActive ? "text-blue-800" : "text-slate-700"}`}>
                              {lesson.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter italic">
                              {isActive ? "Currently Playing" : isDone ? "Completed" : "Not started"}
                            </span>
                          </div>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${isDone ? "bg-emerald-500 text-white" : isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                            }`}>
                            {isDone ? <CheckCircle2 size={16} /> : <Play size={16} fill="currentColor" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}