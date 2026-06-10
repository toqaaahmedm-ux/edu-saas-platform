import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const { user, error } = await requireAuth(['TEACHER', 'ADMIN']);
  if (error) return error;

  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: user!.id } as any, // BL-02: UUID مش اسم
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: courses });
  } catch (err) {
    console.error('[GET /api/teacher/courses]', err);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}