import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// POST — تسجيل في كورس
export async function POST(request: Request) {
  const { user, error } = await requireAuth(['STUDENT']);
  if (error) return error;

  try {
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: 'courseId is required' },
        { status: 400 }
      );
    }

    // تأكد إن الكورس موجود
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // تأكد إن الطالب مش مسجل بالفعل
    const existing = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: user!.id, courseId } },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Already enrolled' },
        { status: 409 }
      );
    }

    // إنشاء الـ enrollment
    const enrollment = await prisma.enrollment.create({
      data: { studentId: user!.id, courseId },
    });

    // تحديث enrollmentCount في الكورس
    await prisma.course.update({
      where: { id: courseId },
      data: { enrollmentCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: enrollment }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/enrollments]', err);
    return NextResponse.json(
      { success: false, message: 'Failed to enroll' },
      { status: 500 }
    );
  }
}

// GET — جلب كورسات الطالب المسجل فيها
export async function GET() {
  const { user, error } = await requireAuth(['STUDENT']);
  if (error) return error;

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: user!.id },
      include: { course: true },
    });

    const courses = enrollments.map((e) => e.course);
    return NextResponse.json({ success: true, data: courses }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/enrollments]', err);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}