import { NextResponse } from 'next/server';

export async function GET() {
  // هنا في الحقيقة بنعمل query للداتا بيز
  // حالياً بنرجع بيانات منظمة عشان الداشبورد تقرأها
  const stats = {
    totalStudents: 1450, // أرقام حقيقية من السيرفر
    publishedCourses: 8,
    activeQuizzes: 15,
    avgRating: 4.95,
  };

  return NextResponse.json({ data: stats });
}