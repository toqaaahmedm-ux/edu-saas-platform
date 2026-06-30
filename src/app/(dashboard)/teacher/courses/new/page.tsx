"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Upload, X } from "lucide-react";
import { coursesApi } from "@/lib/api/courses.api";
import { uploadApi } from "@/lib/api/upload.api";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { courseSchema } from "@/lib/validators/course.schema";

export default function NewCoursePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [videoName, setVideoName] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    videoUrl: "",
    thumbnail: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const url = await uploadApi.uploadCourseImage(file);
      setForm((prev) => ({ ...prev, thumbnail: url }));
      setThumbnailPreview(url);
      toast.success("تم رفع الصورة بنجاح ✅");
    } catch {
      toast.error("فشل رفع الصورة");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingVideo(true);
      setVideoName(file.name);
      // ✅ FE-C01: استخدام videoData.url بدل الـ object كله
      const videoData = await uploadApi.uploadCourseVideo(file);
      setForm((prev) => ({ ...prev, videoUrl: videoData.url }));
      toast.success("تم رفع الفيديو بنجاح ✅");
    } catch {
      toast.error("فشل رفع الفيديو");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleSubmit = async () => {
    const result = courseSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      setIsLoading(true);
      await coursesApi.create({
        title: result.data.title,
        description: result.data.description,
        category: result.data.category ?? "",
        price: result.data.price ?? 0,
        videoUrl: result.data.videoUrl ?? "",
        thumbnail: result.data.thumbnail ?? "",
        instructorId: user?.id,
      } as any);
      toast.success("Course created successfully! 🎉");
      router.push("/teacher/courses");
    } catch {
      toast.error("Failed to create course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Create New Course</h1>
          <p className="text-slate-500 mt-1">Fill in the details below to publish a new course.</p>
        </div>
        <button onClick={() => router.back()} title="Go back" className="flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-2xl font-black hover:bg-slate-200 transition">
          <ChevronLeft size={18} /> Back
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">Course Thumbnail</label>
          {thumbnailPreview ? (
            <div className="relative">
              <img src={thumbnailPreview} alt="thumbnail" className="w-full h-48 object-cover rounded-2xl" />
              <button onClick={() => { setThumbnailPreview(""); setForm((prev) => ({ ...prev, thumbnail: "" })); }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1" title="Remove thumbnail">
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
              {isUploadingImage ? <Loader2 size={32} className="animate-spin text-blue-500" /> : (
                <><Upload size={32} className="text-slate-400 mb-2" /><p className="text-slate-500 font-medium">Click to upload image</p><p className="text-slate-400 text-sm">JPEG, PNG, WebP — max 5MB</p></>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>

        {/* Video Upload */}
        <div>
          <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">Course Video</label>
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
            {isUploadingVideo ? (
              <div className="flex flex-col items-center gap-2"><Loader2 size={32} className="animate-spin text-blue-500" /><p className="text-slate-500 text-sm">Uploading video...</p></div>
            ) : videoName ? (
              <div className="flex flex-col items-center gap-2"><p className="text-green-600 font-bold">✅ {videoName}</p><p className="text-slate-400 text-sm">Click to change</p></div>
            ) : (
              <><Upload size={32} className="text-slate-400 mb-2" /><p className="text-slate-500 font-medium">Click to upload video</p><p className="text-slate-400 text-sm">MP4, WebM, MOV — max 500MB</p></>
            )}
            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
          </label>
        </div>

        {/* Text Fields */}
        {[
          { name: "title", label: "Course Title *", placeholder: "e.g. Introduction to Human Anatomy" },
          { name: "category", label: "Category", placeholder: "e.g. Anatomy" },
          { name: "price", label: "Price (EGP)", placeholder: "e.g. 300", type: "number" },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">{field.label}</label>
            <input name={field.name} type={field.type || "text"} value={form[field.name as keyof typeof form]} onChange={handleChange} placeholder={field.placeholder}
              className={`w-full px-5 py-4 rounded-2xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 ${errors[field.name] ? "border-red-400 focus:ring-red-300" : "border-slate-200"}`}
            />
            {errors[field.name] && <p className="text-red-500 text-xs font-bold mt-1">{errors[field.name]}</p>}
          </div>
        ))}

        {/* Description */}
        <div>
          <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Write a short description of the course..." rows={4}
            className={`w-full px-5 py-4 rounded-2xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 resize-none ${errors.description ? "border-red-400 focus:ring-red-300" : "border-slate-200"}`}
          />
          {errors.description && <p className="text-red-500 text-xs font-bold mt-1">{errors.description}</p>}
        </div>

        <button onClick={handleSubmit} disabled={isLoading} title="Create course"
          className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
          {isLoading ? <><Loader2 size={20} className="animate-spin" /> Creating...</> : "Create Course 🚀"}
        </button>
      </div>
    </div>
  );
}