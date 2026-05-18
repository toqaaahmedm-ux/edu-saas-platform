"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormInput from "@/components/shared/FormInput";
import { Save, LayoutGrid, Loader2, ImagePlus } from "lucide-react";
import { useTeacherStore } from "@/store/useTeacherStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

// [تقرير 1 - صفحة 3]: الـ Schema هنا بتضمن إن السعر يدخل رقم (Fix NEW-08)
const courseSchema = z.object({
  title: z.string().min(5, "Course title is too short (min 5 chars)"),
  description: z.string().min(20, "Please provide a more detailed description"),
  price: z.string().min(1, "Price is required"),
  category: z.string().min(1, "Please select a specialty"),
});

type CourseInput = z.infer<typeof courseSchema>;

export default function NewCoursePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addCourse = useTeacherStore((state) => state.addCourse);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
  });

  const onSubmit = async (data: CourseInput) => {
    setIsSubmitting(true);
    try {
      // [Fix NEW-07]: شيلنا الـ Fake API وبقينا نستخدم الـ Store الحقيقي عشان البيانات تتحفظ فعلاً
      // وحولنا السعر لـ Number عشان نطابق العقد الجديد (Fix NEW-08)
      
      addCourse({
        title: data.title,
        description: data.description,
        price: Number(data.price), // تحويل السعر لرقم هنا مهم جداً
        category: data.category,
        thumbnail: "https://placehold.co", // صورة افتراضية
      }, user?.name || "Instructor");

      toast.success("Course published successfully! 🎉");
      
      // بنوجه المدرس لصفحة الكورسات عشان يشوف الكورس اللي ضافه
      router.push("/teacher/courses");
    } catch (error) {
      toast.error("Failed to publish course. Please check your data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 text-left pb-10">
      
      
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg">
          <LayoutGrid size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800">Create New Course</h2>
          <p className="text-slate-500 font-medium italic">Empower students with your scientific knowledge.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Course Info Section */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-blue-600 mb-4 border-l-4 border-blue-600 pl-3">Course Info</h3>
          
          <FormInput
            label="Course Title"
            register={register("title")}
            error={errors.title?.message}
            placeholder="e.g., Advanced Physiology"
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Course Description</label>
            <textarea
              {...register("description")}
              className={`p-4 border rounded-2xl min-h-[150px] outline-none transition-all ${
                errors.description ? "border-red-500" : "border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              }`}
              placeholder="Provide a detailed roadmap..."
            />
            {errors.description && <span className="text-xs text-red-500 font-medium">{errors.description.message}</span>}
          </div>
        </div>

        {/* Pricing & Category */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-blue-600 mb-4 border-l-4 border-blue-600 pl-3">Meta Data</h3>
            
            <FormInput
              label="Price (EGP)"
              type="number" // خليناه Number في الواجهة كمان لراحة المستخدم
              register={register("price")}
              error={errors.price?.message}
              placeholder="0.00"
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Medical Specialty</label>
              <select
                {...register("category")}
                className="p-3 border rounded-xl border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="">Select specialty...</option>
                <option value="Anatomy">Anatomy</option>
                <option value="Physiology">Physiology</option>
                <option value="Biochemistry">Biochemistry</option>
              </select>
              {errors.category && <span className="text-xs text-red-500 font-medium">{errors.category.message}</span>}
            </div>
          </div>

          <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border-2 border-dashed border-blue-200 flex flex-col items-center justify-center gap-3">
            <ImagePlus className="text-blue-400" size={40} />
            <p className="text-blue-600 font-bold text-sm">Cover Image Placeholder</p>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end gap-4 border-t pt-8">
          <button type="button" onClick={() => router.back()} className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Publish Course</>}
          </button>
        </div>
      </form>
    </div>
  );
}
