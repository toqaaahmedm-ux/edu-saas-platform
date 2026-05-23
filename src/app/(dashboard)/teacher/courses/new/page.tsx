
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { coursesApi } from "@/lib/api/courses.api";
import { toast } from "sonner";
import { courseSchema } from "@/lib/validators/course.schema";

export default function NewCoursePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: "",
    description: "",
    instructor: "",
    category: "",
    price: "",
    lessonsCount: "",
    videoUrl: "",
    thumbnail: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async () => {
    const result = courseSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
     
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      setIsLoading(true);
      //  ضمان إن الحقول الاختيارية بترجع string مش undefined
      await coursesApi.create({
        title: result.data.title,
        description: result.data.description,
        instructor: result.data.instructor ?? "",
        category: result.data.category ?? "",
        price: result.data.price ?? 0,
        lessonsCount: result.data.lessonsCount ?? 0,
        videoUrl: result.data.videoUrl ?? "",
        thumbnail: result.data.thumbnail ?? "",
      });
      toast.success("Course created successfully! 🎉");
      router.push("/teacher/courses");
    } catch (error: unknown) {
      //  تحديد نوع الـ error
      console.error("Course creation failed:", error);
      toast.error("Failed to create course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Create New Course</h1>
          <p className="text-slate-500 mt-1">Fill in the details below to publish a new course.</p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-2xl font-black hover:bg-slate-200 transition"
        >
          <ChevronLeft size={18} /> Back
        </button>
      </div>

      {/* Form */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        {[
          { name: "title", label: "Course Title *", placeholder: "e.g. Introduction to Human Anatomy" },
          { name: "instructor", label: "Instructor Name", placeholder: "e.g. Dr. Mo.Hafez" },
          { name: "category", label: "Category", placeholder: "e.g. Anatomy" },
          { name: "price", label: "Price (EGP)", placeholder: "e.g. 300", type: "number" },
          { name: "lessonsCount", label: "Number of Lessons", placeholder: "e.g. 10", type: "number" },
          { name: "videoUrl", label: "Video URL (YouTube)", placeholder: "https://www.youtube.com/watch?v=..." },
          { name: "thumbnail", label: "Thumbnail URL", placeholder: "https://images.unsplash.com/..." },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">
              {field.label}
            </label>
            <input
              name={field.name}
              type={field.type || "text"}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              placeholder={field.placeholder}
              className={`w-full px-5 py-4 rounded-2xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 ${
                errors[field.name] ? "border-red-400 focus:ring-red-300" : "border-slate-200"
              }`}
            />
            {errors[field.name] && (
              <p className="text-red-500 text-xs font-bold mt-1">{errors[field.name]}</p>
            )}
          </div>
        ))}

        {/* Description */}
        <div>
          <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">
            Description *
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Write a short description of the course..."
            rows={4}
            className={`w-full px-5 py-4 rounded-2xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 resize-none ${
              errors.description ? "border-red-400 focus:ring-red-300" : "border-slate-200"
            }`}
          />
          {errors.description && (
            <p className="text-red-500 text-xs font-bold mt-1">{errors.description}</p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? <><Loader2 size={20} className="animate-spin" /> Creating...</> : "Create Course 🚀"}
        </button>
      </div>
    </div>
  );
}
