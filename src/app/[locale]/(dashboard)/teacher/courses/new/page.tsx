"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Upload, X } from "lucide-react";
import { coursesApi } from "@/lib/api/courses.api";
import { uploadApi } from "@/lib/api/upload.api";
import { toast } from "sonner";
import { courseSchema } from "@/lib/validators/course.schema";
import { useTranslations } from "next-intl";

export default function NewCoursePage() {
  const router = useRouter();
  const t = useTranslations("teacherNewCourse");
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
      toast.success(t("imageUploadSuccess"));
    } catch {
      toast.error(t("imageUploadFailed"));
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
      // FE-C01: use videoData.url instead of the whole object
      const videoData = await uploadApi.uploadCourseVideo(file);
      setForm((prev) => ({ ...prev, videoUrl: videoData.url }));
      toast.success(t("videoUploadSuccess"));
    } catch {
      toast.error(t("videoUploadFailed"));
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
      toast.error(t("fixErrorsBeforeSubmit"));
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
        // T-06 FIX: instructorId removed from client — backend derives it from
        // the JWT token (req.user.id) so a malicious teacher can't spoof another
        // teacher's identity by sending a different id in the request body
      } as any);
      toast.success(t("courseCreatedSuccess"));
      router.push("/teacher/courses");
    } catch {
      toast.error(t("courseCreateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { name: "title", label: t("courseTitleLabel"), placeholder: t("titlePlaceholder") },
    { name: "category", label: t("categoryLabel"), placeholder: t("categoryPlaceholder") },
    { name: "price", label: t("priceLabel"), placeholder: t("pricePlaceholder"), type: "number" },
  ];

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">{t("createNewCourse")}</h1>
          <p className="text-slate-500 mt-1">{t("fillDetails")}</p>
        </div>
        <button onClick={() => router.back()} title={t("back")} className="flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-2xl font-black hover:bg-slate-200 transition">
          <ChevronLeft size={18} /> {t("back")}
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">{t("courseThumbnail")}</label>
          {thumbnailPreview ? (
            <div className="relative">
              <img src={thumbnailPreview} alt="thumbnail" className="w-full h-48 object-cover rounded-2xl" />
              <button onClick={() => { setThumbnailPreview(""); setForm((prev) => ({ ...prev, thumbnail: "" })); }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1" title={t("removeThumbnail")}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
              {isUploadingImage ? <Loader2 size={32} className="animate-spin text-blue-500" /> : (
                <><Upload size={32} className="text-slate-400 mb-2" /><p className="text-slate-500 font-medium">{t("clickToUploadImage")}</p><p className="text-slate-400 text-sm">{t("imageFormats")}</p></>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>

        {/* Video Upload */}
        <div>
          <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">{t("courseVideo")}</label>
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
            {isUploadingVideo ? (
              <div className="flex flex-col items-center gap-2"><Loader2 size={32} className="animate-spin text-blue-500" /><p className="text-slate-500 text-sm">{t("uploadingVideo")}</p></div>
            ) : videoName ? (
              <div className="flex flex-col items-center gap-2"><p className="text-green-600 font-bold">✅ {videoName}</p><p className="text-slate-400 text-sm">{t("clickToChange")}</p></div>
            ) : (
              <><Upload size={32} className="text-slate-400 mb-2" /><p className="text-slate-500 font-medium">{t("clickToUploadVideo")}</p><p className="text-slate-400 text-sm">{t("videoFormats")}</p></>
            )}
            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
          </label>
        </div>

        {/* Text Fields */}
        {fields.map((field) => (
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
          <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">{t("descriptionLabel")}</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder={t("descriptionPlaceholder")} rows={4}
            className={`w-full px-5 py-4 rounded-2xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 resize-none ${errors.description ? "border-red-400 focus:ring-red-300" : "border-slate-200"}`}
          />
          {errors.description && <p className="text-red-500 text-xs font-bold mt-1">{errors.description}</p>}
        </div>

        <button onClick={handleSubmit} disabled={isLoading} title={t("createCourseButton")}
          className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
          {isLoading ? <><Loader2 size={20} className="animate-spin" /> {t("creating")}</> : t("createCourseButton")}
        </button>
      </div>
    </div>
  );
}
