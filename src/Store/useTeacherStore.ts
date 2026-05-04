import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Course {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  instructor?: string;
  lessons?: number;
  rating?: number;
  createdAt: string;
}

interface TeacherState {
  courses: Course[];
  // التعديل هنا: بنمرر اسم المدرس للدالة بدل ما يكون ثابت
  addCourse: (course: Omit<Course, "id" | "createdAt">, instructorName: string) => void;
  deleteCourse: (id: string) => void;
}

export const useTeacherStore = create<TeacherState>()(
  persist(
    (set) => ({
      courses: [],
      addCourse: (newCourse, instructorName) =>
        set((state) => ({
          courses: [
            ...state.courses,
            {
              ...newCourse,
              id: `crs-${Math.random().toString(36).substr(2, 9)}`, // ID احترافي أكتر
              createdAt: new Date().toISOString(), // ISO String أحسن للبيانات
              instructor: instructorName, // بناخد الاسم من المستخدم اللي مسجل دخول
              lessons: 0,
              rating: 5.0,
            },
          ],
        })),
      deleteCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((course) => course.id !== id),
        })),
    }),
    { name: "teacher-storage" }
  )
);
