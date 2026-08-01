"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { FileQuestion, Search, Clock, Loader2, ChevronRight, ChevronLeft, Lock, Hourglass } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useTranslations } from "next-intl";

type QuizAvailability = "upcoming" | "open" | "closed";

interface Quiz {
  id: string;
  title: string;
  timeLimit: number;
  courseId: string;
  course: { title: string };
  questions: { id: string }[];
  // QUIZ-WINDOW-NEW
  openAt?: string | null;
  closeAt?: string | null;
  availability?: QuizAvailability;
}

// QUIZ-WINDOW-NEW: computes a simple, readable diff like "in 2d 4h" or "in 45m"
function formatCountdown(targetIso: string, now: number): string {
  const diffMs = new Date(targetIso).getTime() - now;
  if (diffMs <= 0) return "";
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function QuizzesListInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const t = useTranslations("studentQuizzes");

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  // QUIZ-WINDOW-NEW: "ticks" every minute so the countdown updates on its own without
  // the student needing to refresh the page.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    const url = courseId ? `/quiz?courseId=${courseId}` : "/quiz";
    apiClient.get(url)
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setQuizzes(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setLoadError(
          err?.response?.status === 403
            ? t("notEnrolled")
            : t("loadError")
        );
      })
      .finally(() => setIsLoading(false));
  }, [courseId, t]);

  const filtered = quizzes.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m} min`;
  };

  const courseTitle = quizzes[0]?.course?.title;

  // QUIZ-WINDOW-NEW: returns the right badge text and icon, or null if the quiz
  // is just open as normal (same as before, no extra badge)
  const getBadge = (quiz: Quiz) => {
    if (quiz.availability === "upcoming" && quiz.openAt) {
      const countdown = formatCountdown(quiz.openAt, now);
      return {
        text: countdown ? t("opensIn", { time: countdown }) : t("opensNow"),
        icon: Hourglass,
        className: "bg-amber-50 text-amber-600 border-amber-100",
      };
    }
    if (quiz.availability === "closed") {
      return {
        text: t("quizClosed"),
        icon: Lock,
        className: "bg-slate-100 text-slate-500 border-slate-200",
      };
    }
    if (quiz.availability === "open" && quiz.closeAt) {
      const countdown = formatCountdown(quiz.closeAt, now);
      if (countdown) {
        return {
          text: t("closesIn", { time: countdown }),
          icon: Clock,
          className: "bg-blue-50 text-blue-600 border-blue-100",
        };
      }
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left pb-10 w-full max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-blue-50">
        <div>
          {courseId && (
            <Link
              href={`/student/courses/${courseId}`}
              className="inline-flex items-center gap-1 text-xs font-black text-blue-500 uppercase tracking-widest mb-3 hover:underline"
            >
              <ChevronLeft size={14} /> {t("backToCourse")}
            </Link>
          )}
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            {courseId ? (courseTitle ? t("quizzesTitle", { course: courseTitle }) : t("courseQuizzes")) : t("quizzes")}
          </h2>
          <p className="text-slate-500 font-medium italic">{t("subtitle")}</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none transition-all font-bold text-sm placeholder:text-slate-300"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-400 font-black tracking-widest uppercase text-xs">{t("loadingQuizzes")}</p>
        </div>
      ) : loadError ? (
        <EmptyState
          title={t("couldntLoad")}
          description={loadError}
          icon={FileQuestion}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t("noQuizzesFound")}
          description={courseId ? t("noQuizzesForCourse") : t("noQuizzesYet")}
          icon={FileQuestion}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filtered.map((quiz) => {
            // QUIZ-WINDOW-NEW: quizzes without availability data (if we cleared the old
            // cache or something went wrong) are treated as "open", same as the original behavior.
            const isLocked = quiz.availability === "upcoming" || quiz.availability === "closed";
            const badge = getBadge(quiz);
            const BadgeIcon = badge?.icon;

            return (
              <div
                key={quiz.id}
                onClick={() => {
                  if (isLocked) return;
                  router.push(`/student/quizzes/${quiz.id}`);
                }}
                className={`group bg-white rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-300 overflow-hidden flex flex-col ${
                  isLocked
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                }`}
              >
                <div className={`h-2 w-full ${isLocked ? "bg-slate-300" : "bg-gradient-to-r from-blue-500 to-blue-400"}`} />
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {quiz.course?.title && (
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full inline-block">
                          {quiz.course.title}
                        </span>
                      )}
                      {badge && BadgeIcon && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${badge.className}`}>
                          <BadgeIcon size={12} /> {badge.text}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-xl font-black mb-4 transition-colors leading-tight ${isLocked ? "text-slate-500" : "text-slate-800 group-hover:text-blue-600"}`}>
                      {quiz.title}
                    </h3>
                    <div className="flex items-center gap-4 text-slate-400">
                      <span className="flex items-center gap-1.5 text-xs font-bold">
                        <FileQuestion size={14} />
                        {quiz.questions?.length ?? "?"} {t("questions")}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold">
                        <Clock size={14} />
                        {fmt(quiz.timeLimit)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {isLocked ? badge?.text : t("startQuiz")}
                    </span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors shadow-lg ${
                      isLocked ? "bg-slate-300" : "bg-blue-600 group-hover:bg-blue-700"
                    }`}>
                      {isLocked ? <Lock size={16} /> : <ChevronRight size={18} />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function QuizzesListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    }>
      <QuizzesListInner />
    </Suspense>
  );
}