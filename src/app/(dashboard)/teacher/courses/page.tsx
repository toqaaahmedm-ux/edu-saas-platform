"use client";

import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit, Loader2, Eye, EyeOff, Users, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useCourses, useDeleteCourse, useUpdateCourse } from "@/services/courses.service";
import { Course } from "@/types";

export default function CoursesPage() {
  const router = useRouter();
  const { data: courses = [], isLoading, isError } = useCourses();
  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse();
  const { mutate: updateCourse } = useUpdateCourse();

  const handleToggleStatus = (course: Course) => {
    const newStatus = course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    updateCourse(
      { id: course.id, data: { ...course, status: newStatus } },
      {
        onSuccess: () => toast.success(`Course ${newStatus === "PUBLISHED" ? "published" : "unpublished"}!`),
        onError: () => toast.error("Failed to update status"),
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
        <p className="text-red-500 font-medium">Failed to load courses. Please try again.</p>
      </div>
    );
  }

  const published = courses.filter((c: any) => c.status === "PUBLISHED").length;
  const drafts = courses.filter((c: any) => c.status !== "PUBLISHED").length;

  return (
    <div className="p-8">
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
          <p className="text-3xl font-black text-slate-800">{courses.length}</p>
          <BookOpen size={16} className="text-blue-400 mt-1" />
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Published</p>
          <p className="text-3xl font-black text-emerald-600">{published}</p>
          <Eye size={16} className="text-emerald-400 mt-1" />
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Drafts</p>
          <p className="text-3xl font-black text-orange-500">{drafts}</p>
          <EyeOff size={16} className="text-orange-400 mt-1" />
        </div>
      </div>

      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-black">My Courses</h1>
        <button
          onClick={() => router.push("/teacher/courses/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          title="Add new course"
        >
          <Plus size={18} /> Add New Course
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
                  {course.status === "PUBLISHED" ? "Published" : "Draft"}
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
                  title="Edit course"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleToggleStatus(course)}
                  className={`p-2 rounded-lg transition ${
                    course.status === "PUBLISHED"
                      ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                      : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  }`}
                  title={course.status === "PUBLISHED" ? "Unpublish course" : "Publish course"}
                >
                  {course.status === "PUBLISHED" ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  disabled={isDeleting}
                  onClick={() =>
                    deleteCourse(course.id, {
                      onSuccess: () => toast.success("Course deleted successfully"),
                      onError: () => toast.error("Failed to delete course"),
                    })
                  }
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
                  title="Delete course"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
          <p className="text-slate-500 font-medium">No courses available. Start creating your first one!</p>
        </div>
      )}
    </div>
  );
}