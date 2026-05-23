// ملف مشترك بين كل الـ routes عشان البيانات متتمسحش

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  category: string;
  price: number;
  lessonsCount: number;
  videoUrl?: string;
  enrolledStudents?: number;
  createdAt: Date;
}

const globalForCourses = global as typeof globalThis & { courses: Course[] };

if (!globalForCourses.courses) {
  globalForCourses.courses = [
    {
      id: "9ac76934-6d9b-4795-93c2-add2d3c80438",
      title: "Introduction to Human Anatomy",
      description: "نظرة شاملة على هيكل جسم الإنسان.",
      instructor: "Dr. Mo.Hafez",
      thumbnail: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800",
      category: "Anatomy",
      price: 300,
      lessonsCount: 10,
      videoUrl: "https://www.youtube.com/watch?v=eE7I3OKn_e8",
      createdAt: new Date(),
    },
  ];
}

export const courses = globalForCourses.courses;
export type { Course };