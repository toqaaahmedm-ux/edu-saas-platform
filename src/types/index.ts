// src/types/index.ts
export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  category: string;
  price: number;
  lessonsCount: number;
  videoUrl?: string; // 👈 هذا السطر هو الحل السحري لكل الأخطاء اللي في الصورة
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  videoUrl: string;
  duration: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
}
