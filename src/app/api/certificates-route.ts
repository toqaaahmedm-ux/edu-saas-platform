import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// POST — حفظ شهادة جديدة
export async function POST(request: Request) {
  const { user, error } = await requireAuth(['STUDENT']);
  if (error) return error;

  try {
    const { examName, institutionName, facultyName } = await request.json();

    // جلب أول كورس الطالب enrolled فيه
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId: user!.id },
      orderBy: { enrolledAt: 'asc' },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: 'No enrolled courses found' },
        { status: 404 }
      );
    }

    const courseId = enrollment.courseId;

    // تأكد إن الطالب مش عنده شهادة لنفس الكورس
    const existing = await prisma.certificate.findFirst({
      where: { studentId: user!.id, courseId },
    });

    if (existing) {
      return NextResponse.json({ success: true, data: existing }, { status: 200 });
    }

    const certificate = await prisma.certificate.create({
      data: {
        studentId: user!.id,
        courseId,
        examName: examName || "General Medical Anatomy",
        institutionName: institutionName || "Ain Shams University",
        facultyName: facultyName || "Faculty of Medicine - ASU",
      },
    });

    return NextResponse.json({ success: true, data: certificate }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/certificates]', err);
    return NextResponse.json(
      { success: false, message: 'Failed to save certificate' },
      { status: 500 }
    );
  }
}

// GET — جلب شهادات الطالب
export async function GET() {
  const { user, error } = await requireAuth(['STUDENT']);
  if (error) return error;

  try {
    const certificates = await prisma.certificate.findMany({
      where: { studentId: user!.id },
      include: { course: true },
      orderBy: { issuedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: certificates }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/certificates]', err);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}