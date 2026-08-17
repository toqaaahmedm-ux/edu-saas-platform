"use client";

import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit, Loader2, Eye, EyeOff, Users, BookOpen, ClipboardList, Layers, Award, ClipboardCheck, Video } from "lucide-react";
import { toast } from "sonner";
import { useCourses, useDeleteCourse, useUpdateCourse } from "@/services/courses.service";
import { Course } from "@/types";
import { useTranslations } from "next-intl";

export default function CoursesPage() {
  const router = useRouter();
  const t = useTranslations("teacherCourses");
  const { data: courses = [], isLoading, isError } = useCourses();
  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse();
  const { mutate: updateCourse } = useUpdateCourse();

  const handleToggleStatus = (course: Course) => {
    const newStatus = course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    updateCourse(
      { id: course.id, data: { ...course, status: newStatus } },
      {
        onSuccess: () => toast.success(newStatus === "PUBLISHED" ? t("coursePublishedToast") : t("courseUnpublishedToast")),
        onError: () => toast.error(t("updateStatusFailed")),
      }
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
        <p className="text-red-500 font-medium">{t("loadFailed")}</p>
      </div>
    );
  }

  const published = courses.filter((c: any) => c.status === "PUBLISHED").length;
  const drafts = courses.filter((c: any) => c.status !== "PUBLISHED").length;

  return (
    <div className="p-8">
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("total")}</p>
          <p className="text-3xl font-black text-slate-800">{courses.length}</p>
          <BookOpen size={16} className="text-blue-400 mt-1" />
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("published")}</p>
          <p className="text-3xl font-black text-emerald-600">{published}</p>
          <Eye size={16} className="text-emerald-400 mt-1" />
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("drafts")}</p>
          <p className="text-3xl font-black text-orange-500">{drafts}</p>
          <EyeOff size={16} className="text-orange-400 mt-1" />
        </div>
      </div>

      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-black">{t("myCourses")}</h1>
        <button
          onClick={() => router.push("/teacher/courses/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          title={t("addNewCourse")}
        >
          <Plus size={18} /> {t("addNewCourse")}
        </button>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <div key={course.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-black px-3 py-1 rounded-full ${
                  course.status === "PUBLISHED"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-orange-100 text-orange-700"
                }`}>
                  {course.status === "PUBLISHED" ? t("statusPublished") : t("statusDraft")}
                </span>
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <Users size={12} />
                  <span>{course.enrollmentCount || 0}</span>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-2">{course.title}</h3>
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">{course.description}</p>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => router.push(`/teacher/courses/${course.id}/edit`)}
                  className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"
                  title={t("editCourse")}
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => router.push(`/teacher/courses/${course.id}/lessons`)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  title={t("manageLessons")}
                >
                  <BookOpen size={16} />
                </button>

                <button
                  onClick={() => router.push(`/teacher/courses/${course.id}/modules`)}
                  className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
                  title={t("manageModules")}
                >
                  <Layers size={16} />
                </button>

                <button
                  onClick={() => router.push(`/teacher/courses/${course.id}/assignments`)}
                  className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                  title={t("manageAssignments")}
                >
                  <ClipboardList size={16} />
                </button>

                <button
                  onClick={() => router.push(`/teacher/courses/${course.id}/grades`)}
                  className="p-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100"
                  title={t("viewGrades")}
                >
                  <Award size={16} />
                </button>

                <button
                  onClick={() => router.push(`/teacher/courses/${course.id}/attendance`)}
                  className="p-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100"
                  title={t("takeAttendance")}
                >
                  <ClipboardCheck size={16} />
                </button>

        <button
          onClick={() => router.push(`/teacher/courses/${course.id}/live-sessions`)}
          className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
          title={t("manageLiveSessions")}
        >
          <Video size={16} />
        </button>

                <button
                  onClick={() => handleToggleStatus(course)}
                  className={`p-2 rounded-lg transition ${
                    course.status === "PUBLISHED"
                      ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                      : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  }`}
                  title={course.status === "PUBLISHED" ? t("unpublishCourse") : t("publishCourse")}
                >
                  {course.status === "PUBLISHED" ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>

                <button
                  disabled={isDeleting}
                  onClick={() =>
                    deleteCourse(course.id, {
                      onSuccess: () => toast.success(t("courseDeletedToast")),
                      onError: () => toast.error(t("deleteFailed")),
                    })
                  }
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
                  title={t("deleteCourse")}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
          <p className="text-slate-500 font-medium">{t("noCoursesAvailable")}</p>
        </div>
      )}
    </div>
  );
}