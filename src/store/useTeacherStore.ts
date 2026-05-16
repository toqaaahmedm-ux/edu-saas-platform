import { create } from "zustand";
import { persist } from "zustand/middleware";
// [تقرير 1 - صفحة 3]: ندينا الـ Course من المصدر الأساسي عشان نوحد السعر والبيانات (Fix NEW-08)
import { Course } from "@/types"; 

interface TeacherState {
  courses: Course[];
  // بناخد بيانات الكورس من غير الـ ID والـ Date لأننا بنكريتهم هنا
  addCourse: (course: Omit<Course, "id" | "createdAt" | "lessonsCount" | "instructor">, instructorName: string) => void;
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
              id: `crs-${Math.random().toString(36).substr(2, 9)}`,
              createdAt: new Date().toISOString(),
              instructor: instructorName,
              lessonsCount: 0, // اتعدلت هنا عشان تطابق الـ Interface الجديد (lessonsCount)
              enrolledStudents: 0,
              rating: 5.0,
            } as Course, // بنأكد عليه إنه يستخدم الـ Type الصح
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
