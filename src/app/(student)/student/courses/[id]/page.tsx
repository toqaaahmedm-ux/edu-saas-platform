"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, CheckCircle2, FileText, MessageCircle, Play, VideoOff, Loader2 } from "lucide-react";
import { coursesApi } from "@/lib/api/courses.api";
import { Course } from "@/types";
import { COURSES } from "@/data/courses.data";
import { toast } from "sonner";

export default function CourseContentPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [currentLesson, setCurrentLesson] = useState(0);

  useEffect(() => { setIsClient(true); }, []);

  // تحميل الـ completed lessons من localStorage
  useEffect(() => {
    if (!id) return;
    const saved = localStorage.getItem(`completed-${id}`);
    if (saved) setCompletedLessons(JSON.parse(saved));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const response = await coursesApi.getById(id);
        setCourse(response.data?.data || null);
      } catch {
        const staticCourse = COURSES.find((c) => String(c.id) === String(id)) || COURSES[0];
        setCourse(staticCourse as Course);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleComplete = () => {
    if (completedLessons.includes(currentLesson)) return;
    const updated = [...completedLessons, currentLesson];
    setCompletedLessons(updated);
    localStorage.setItem(`completed-${id}`, JSON.stringify(updated));
    toast.success("Lesson marked as completed! Keep going 🚀");
  };

  if (!isClient || isLoading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!course) {
    return <div className="p-10 text-center font-bold text-red-500">Course not found.</div>;
  }

  const lessonsCount = course.lessonsCount || 1;
  const lessons = Array.from({ length: lessonsCount }, (_, i) => ({
    index: i,
    title: i === 0 ? course.title : `Lesson ${i + 1}`,
  }));

  const isCurrentCompleted = completedLessons.includes(currentLesson);
  const progress = Math.round((completedLessons.length / lessonsCount) * 100);

  const hasValidVideo = !!course.videoUrl && course.videoUrl.trim() !== "";
  const embedUrl = course.videoUrl
    ?.replace("watch?v=", "embed/")
    .replace("youtu.be/", "www.youtube.com/embed/");

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 text-left animate-in fade-in duration-700 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{course.title}</h1>
          <p className="text-slate-500 font-medium italic">
            Instructor: <span className="text-blue-600 font-black">{course.instructor}</span>
          </p>
          {/* Progress Bar */}
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

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Player */}
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-slate-950 rounded-[3rem] border-[12px] border-white shadow-2xl overflow-hidden">
            {hasValidVideo ? (
              <iframe
                src={embedUrl}
                title={course.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                <VideoOff size={48} />
                <p className="font-bold text-lg">No video available for this course</p>
              </div>
            )}
          </div>

          {/* Interaction Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm gap-4">
            <div className="flex gap-8">
              <button className="flex items-center gap-2 font-black text-slate-400 hover:text-blue-600 transition-colors text-[10px] uppercase tracking-[0.2em]">
                <MessageCircle size={20} /> Discussion
              </button>
              <button className="flex items-center gap-2 font-black text-slate-400 hover:text-blue-600 transition-colors text-[10px] uppercase tracking-[0.2em]">
                <FileText size={20} /> Resources
              </button>
              <button
                onClick={() => router.push('/student/quizzes')}
                className="flex items-center gap-2 font-black text-slate-400 hover:text-purple-600 transition-colors text-[10px] uppercase tracking-[0.2em]"
              >
                <CheckCircle2 size={20} /> Take Quiz
              </button>
            </div>
            <button
              onClick={handleComplete}
              disabled={isCurrentCompleted}
              className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${isCurrentCompleted
                  ? "bg-emerald-500 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white"
                }`}
            >
              <CheckCircle2 size={22} /> {isCurrentCompleted ? "COMPLETED ✓" : "MARK AS DONE"}
            </button>
          </div>
        </div>

        {/* Curriculum Sidebar */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-lg h-fit sticky top-28">
          <h3 className="text-xl font-black text-slate-800 mb-8 border-b pb-4 flex items-center justify-between">
            Curriculum
            <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
              {completedLessons.length}/{lessonsCount}
            </span>
          </h3>
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const isActive = currentLesson === lesson.index;
              const isDone = completedLessons.includes(lesson.index);
              return (
                <button
                  key={lesson.index}
                  onClick={() => setCurrentLesson(lesson.index)}
                  className={`w-full p-4 rounded-[1.5rem] border-2 flex justify-between items-center transition-all ${isActive
                      ? "border-blue-600 bg-blue-50/30 shadow-md"
                      : "border-slate-100 hover:border-slate-200"
                    }`}
                >
                  <div className="flex flex-col text-left">
                    <span className={`font-black text-sm ${isActive ? "text-blue-800" : "text-slate-700"}`}>
                      {String(lesson.index + 1).padStart(2, "0")}. {lesson.title}
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

      </div>
    </div>
  );
}