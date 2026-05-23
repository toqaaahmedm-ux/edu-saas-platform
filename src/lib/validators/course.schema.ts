import { z } from "zod";

// ✅ TC-10: نقل الـ schema من new/page.tsx لهنا
export const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  instructor: z.string().optional(),
  category: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or more").default(0),
  lessonsCount: z.coerce.number().min(0).default(0),
  videoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  thumbnail: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type CourseFormData = z.infer<typeof courseSchema>;