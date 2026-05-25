import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const { user, error } = await requireAuth(['TEACHER', 'ADMIN']);
  if (error) return error;

  try {
    // كورسات المعلم
    const courses = await prisma.course.findMany({
      where: { instructor: user!.name },
    });

    const courseIds = courses.map((c) => c.id);

    // عدد الطلاب المسجلين في كورساته
    const totalStudents = await prisma.enrollment.count({
      where: { courseId: { in: courseIds } },
    });

    // كورسات published
    const publishedCourses = courses.filter((c) => c.status === 'published').length;

    // quizzes
    const activeQuizzes = await prisma.quiz.count({
      where: { courseId: { in: courseIds } },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        publishedCourses,
        activeQuizzes,
        avgRating: 4.8, // static لحد ما نضيف ratings
      },
    });
  } catch (err) {
    console.error('[GET /api/teacher/stats]', err);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}