"use client";

import { useState, useEffect } from "react";
import { Plus, Save, Trash2, HelpCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { quizzesApi } from "@/lib/api/quizzes.api";
import { coursesApi } from "@/lib/api/courses.api";
import { useTranslations } from "next-intl";

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

interface Course {
  id: string;
  title: string;
}

export default function QuizBuilderPage() {
  const t = useTranslations("teacherQuizBuilder");
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, text: "", options: ["", "", "", ""], correct: 0 }
  ]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(600);
  const [passScore, setPassScore] = useState(70);
  // empty values = no time restriction, same as old behaviour
  const [openAt, setOpenAt] = useState("");
  const [closeAt, setCloseAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await coursesApi.getMyCourses();
        setCourses((res.data as any)?.data || []);
      } catch {
        toast.error(t("loadCoursesFailed"));
      } finally {
        setIsLoadingCourses(false);
      }
    }
    loadCourses();
  }, []);

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      id: Date.now(),
      text: "",
      options: ["", "", "", ""],
      correct: 0
    }]);
    toast.info(t("questionAdded"));
  };

  const removeQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    } else {
      toast.error(t("atLeastOneQuestion"));
    }
  };

  const updateQuestion = (id: number, field: string, value: any, optionIndex?: number) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== id) return q;
      if (field === 'options' && typeof optionIndex === 'number') {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return { ...q, [field]: value };
    }));
  };

  const handleSave = async () => {
    if (!selectedCourseId) {
      toast.error(t("selectCourseFirst"));
      return;
    }
    if (!quizTitle.trim()) {
      toast.error(t("enterQuizTitle"));
      return;
    }
    const emptyQuestions = questions.some(
      q => !q.text.trim() || q.options.some(o => !o.trim())
    );
    if (emptyQuestions) {
      toast.error(t("fillAllQuestions"));
      return;
    }
    // if both dates are set, close must be after open
    if (openAt && closeAt && new Date(closeAt) <= new Date(openAt)) {
      toast.error(t("closeDateAfterOpen"));
      return;
    }

    try {
      setIsSaving(true);
      await quizzesApi.createQuiz({
        courseId: selectedCourseId,
        title: quizTitle,
        timeLimit,
        passScore,
        openAt: openAt || undefined,
        closeAt: closeAt || undefined,
        questions: questions.map(q => ({
          text: q.text,
          options: q.options,
          correctIndex: q.correct,
        })),
      });

      toast.success(t("savedSuccess"));
      router.push(`/teacher/courses`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 text-left pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-500 text-white rounded-2xl shadow-lg">
            <HelpCircle size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">{t("title")}</h2>
            <p className="text-slate-500 font-medium italic">{t("subtitle")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-orange-600 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} /> {t("addQuestion")}
        </button>
      </div>

      {/* Quiz Settings */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-slate-800">{t("quizSettings")}</h3>

        {/* Course Selector */}
        <div>
          <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">
            {t("courseLabel")} *
          </label>
          {isLoadingCourses ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 size={16} className="animate-spin" /> {t("loadingCourses")}
            </div>
          ) : (
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-700"
            >
              <option value="">{t("selectCourse")}</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Quiz Title */}
        <div>
          <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">
            {t("quizTitleLabel")} *
          </label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder={t("quizTitlePlaceholder")}
            className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-700"
          />
        </div>

        {/* Time Limit & Pass Score */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">
              {t("timeLimitLabel")}
            </label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              min={60}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-700"
            />
            <p className="text-xs text-slate-400 mt-1">{Math.round(timeLimit / 60)} {t("minutes")}</p>
          </div>
          <div>
            <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">
              {t("passScoreLabel")}
            </label>
            <input
              type="number"
              value={passScore}
              onChange={(e) => setPassScore(Number(e.target.value))}
              min={0}
              max={100}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-700"
            />
          </div>
        </div>

        {/* Availability Window (optional) */}
        <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-50">
          <div>
            <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider mt-6">
              {t("opensAtLabel")}
            </label>
            <input
              type="datetime-local"
              value={openAt}
              onChange={(e) => setOpenAt(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-700"
            />
            <p className="text-xs text-slate-400 mt-1">{t("opensAtHint")}</p>
          </div>
          <div>
            <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider mt-6">
              {t("closesAtLabel")}
            </label>
            <input
              type="datetime-local"
              value={closeAt}
              onChange={(e) => setCloseAt(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-700"
            />
            <p className="text-xs text-slate-400 mt-1">{t("closesAtHint")}</p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-10">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative animate-in slide-in-from-bottom-4">
            <button
              type="button"
              onClick={() => removeQuestion(q.id)}
              className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl"
            >
              <Trash2 size={22} />
            </button>

            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black text-xl">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                  placeholder={t("questionPlaceholder")}
                  className="flex-1 bg-slate-50 border-none p-5 rounded-2xl text-lg font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {q.options.map((option, i) => (
                  <div key={i} className="relative">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateQuestion(q.id, 'options', e.target.value, i)}
                      placeholder={`${t("optionPlaceholder")} ${String.fromCharCode(65 + i)}`}
                      className={`w-full p-5 pl-14 rounded-2xl border transition-all text-sm font-bold outline-none ${
                        i === q.correct
                          ? "border-green-500 bg-green-50/30 ring-1 ring-green-500"
                          : "border-slate-100 bg-slate-50/50 focus:border-orange-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => updateQuestion(q.id, 'correct', i)}
                      className={`absolute left-5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                        i === q.correct
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-slate-200 text-transparent hover:border-green-300"
                      }`}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-10 border-t">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-3 bg-green-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl shadow-green-200 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSaving ? (
            <><Loader2 size={24} className="animate-spin" /> {t("saving")}</>
          ) : (
            <><Save size={24} /> {t("saveQuiz")}</>
          )}
        </button>
      </div>
    </div>
  );
}