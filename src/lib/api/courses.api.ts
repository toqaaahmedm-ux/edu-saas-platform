import { COURSES } from '@/data/courses.data';
import { Course } from '@/store/useTeacherStore';

// محاكاة لعمليات الكورسات (مطابق للصورة: getAll, getById)
export const coursesApi = {
  // جلب كل الكورسات مع التأخير الوهمي اللي في الـ client
  getAll: async () => {
    // محاكاة تأخير بسيط
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { data: COURSES };
  },

  // جلب كورس معين بالـ ID
  getById: async (id: string) => {
    const course = COURSES.find((c) => c.id === id);
    if (!course) throw new Error("Course not found");
    return { data: course };
  },

  // محاكاة إضافة كورس جديد (للمدرس)
  create: async (courseData: Omit<Course, "id" | "createdAt">) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { success: true, data: courseData };
  }
};
