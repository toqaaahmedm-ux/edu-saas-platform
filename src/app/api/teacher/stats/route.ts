import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const { user, error } = await requireAuth(['TEACHER', 'ADMIN']);
  if (error) return error;

  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: user!.id } as any, // BL-02: UUID مش اسم
    });

    const courseIds = courses.map((c) => c.id);

    const totalStudents = await prisma.enrollment.count({
      where: { courseId: { in: courseIds } },
    });

    // BL-02: PUBLISHED بالكابيتال عشان يتطابق مع الـ enum في NestJS schema
    const publishedCourses = courses.filter((c) => c.status === 'PUBLISHED').length;

    const activeQuizzes = await prisma.quiz.count({
      where: { courseId: { in: courseIds } },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        publishedCourses,
        activeQuizzes,
        avgRating: 4.8,
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