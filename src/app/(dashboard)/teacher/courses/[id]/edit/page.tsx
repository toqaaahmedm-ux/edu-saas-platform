"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    instructor: "",
    thumbnail: "",
    category: "",
    price: "",
    lessonsCount: "",
    videoUrl: "",
    status: "draft",
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${id}`);
        const data = await res.json();
        if (data.success) {
          setForm({
            title: data.data.title || "",
            description: data.data.description || "",
            instructor: data.data.instructor || "",
            thumbnail: data.data.thumbnail || "",
            category: data.data.category || "",
            price: String(data.data.price || ""),
            lessonsCount: String(data.data.lessonsCount || ""),
            videoUrl: data.data.videoUrl || "",
            status: data.data.status || "draft",
          });
        }
      } catch {
        toast.error("Failed to load course");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          lessonsCount: Number(form.lessonsCount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Course updated successfully");
        router.push("/teacher/courses");
      } else {
        toast.error(data.message || "Failed to update course");
      }
    } catch {
      toast.error("Failed to update course");
    } finally {
      setIsSaving(false);
    }
  };

  const fields: { label: string; key: keyof typeof form; placeholder: string }[] = [
    { label: "Title", key: "title", placeholder: "Enter course title" },
    { label: "Description", key: "description", placeholder: "Enter course description" },
    { label: "Instructor", key: "instructor", placeholder: "Enter instructor name" },
    { label: "Thumbnail URL", key: "thumbnail", placeholder: "https://example.com/image.jpg" },
    { label: "Category", key: "category", placeholder: "e.g. Programming, Design..." },
    { label: "Price", key: "price", placeholder: "0.00" },
    { label: "Lessons Count", key: "lessonsCount", placeholder: "0" },
    { label: "Video URL", key: "videoUrl", placeholder: "https://youtube.com/..." },
  ];

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
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">

        {fields.map(({ label, key, placeholder }) => (
          <div key={key}>
            <label htmlFor={key} className="block text-sm font-medium text-slate-700 mb-1">
              {label}
            </label>
            <input
              id={key}
              title={label}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        {/* Status Field */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
            Status
          </label>
          <select
            id="status"
            title="Course Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="animate-spin" size={16} />}
            Save Changes
          </button>
          <button
            onClick={() => router.push("/teacher/courses")}
            className="px-6 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}