"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadApi } from "@/lib/api/upload.api";
import { apiClient } from "@/lib/api/client";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.courseId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [videoName, setVideoName] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    category: "",
    price: "",
    status: "DRAFT",
    videoUrl: "",
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await apiClient.get(`/courses/${id}`);
        const data = (res.data as any)?.data;
        if (data) {
          setForm({
            title: data.title || "",
            description: data.description || "",
            thumbnail: data.thumbnail || "",
            category: data.category || "",
            price: String(data.price || ""),
            status: data.status || "DRAFT",
            videoUrl: data.videoUrl || "",
          });
          if (data.thumbnail) setThumbnailPreview(data.thumbnail);
          // if the course already has a video, show a label so the teacher
          // knows they can replace it without having to re-upload from scratch
          if (data.videoUrl) setVideoName("Current video (click to replace)");
        }
      } catch {
        toast.error("Failed to load course");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const url = await uploadApi.uploadCourseImage(file);
      // use the functional form of setState so we never read stale closure values
      setForm((prev) => ({ ...prev, thumbnail: url }));
      setThumbnailPreview(url);
      toast.success("Image uploaded successfully");
    } catch {
      toast.error("Image upload failed");
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
      const videoData = await uploadApi.uploadCourseVideo(file);
      // uploadCourseVideo can return either an object with a .url field or a
      // plain string — handle both so the URL actually lands in form state
      setForm((prev) => ({ ...prev, videoUrl: (videoData as any)?.url ?? videoData }));
      toast.success("Video uploaded successfully");
    } catch {
      toast.error("Video upload failed");
      setVideoName("");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.put(`/courses/${id}`, {
        title: form.title,
        description: form.description,
        thumbnail: form.thumbnail,
        category: form.category,
        price: Number(form.price),
        status: form.status,
        videoUrl: form.videoUrl, // make sure videoUrl goes in the PUT body, not just local state
      });
      toast.success("Course updated successfully");
      router.push("/teacher/courses");
    } catch {
      toast.error("Failed to update course");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-black mb-8">Edit Course</h1>
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">
            Course Thumbnail
          </label>
          {thumbnailPreview ? (
            <div className="relative">
              <img src={thumbnailPreview} alt="thumbnail" className="w-full h-48 object-cover rounded-2xl" />
              <button
                onClick={() => { setThumbnailPreview(""); setForm((prev) => ({ ...prev, thumbnail: "" })); }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                title="Remove thumbnail"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
              {isUploadingImage ? (
                <Loader2 size={32} className="animate-spin text-blue-500" />
              ) : (
                <>
                  <Upload size={32} className="text-slate-400 mb-2" />
                  <p className="text-slate-500 font-medium">Click to upload image</p>
                  <p className="text-slate-400 text-sm">JPEG, PNG, WebP — max 5MB</p>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>

        {/* Video Upload */}
        <div>
          <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">
            Course Video
          </label>
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
            {isUploadingVideo ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-slate-500 text-sm">Uploading video...</p>
              </div>
            ) : videoName ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-green-600 font-bold">✅ {videoName}</p>
                <p className="text-slate-400 text-sm">Click to change</p>
              </div>
            ) : (
              <>
                <Upload size={32} className="text-slate-400 mb-2" />
                <p className="text-slate-500 font-medium">Click to upload video</p>
                <p className="text-slate-400 text-sm">MP4, WebM, MOV — max 500MB</p>
              </>
            )}
            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
          </label>
        </div>

        {/* Text Fields */}
        {[
          { label: "Title", key: "title", placeholder: "Enter course title" },
          { label: "Category", key: "category", placeholder: "e.g. Anatomy" },
          { label: "Price", key: "price", placeholder: "0.00" },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">
              {label}
            </label>
            <input
              title={label}
              placeholder={placeholder}
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        {/* Description */}
        <div>
          <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">
            Description
          </label>
          <textarea
            title="Description"
            placeholder="Enter course description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wider">
            Status
          </label>
          <select
            title="Course Status"
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            title="Save changes"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-bold"
          >
            {isSaving && <Loader2 className="animate-spin" size={16} />}
            Save Changes
          </button>
          <button
            onClick={() => router.push("/teacher/courses")}
            title="Cancel"
            className="px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}