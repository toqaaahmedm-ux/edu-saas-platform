import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: course }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // SEC-03: ADMIN only
  const { user, error } = await requireAuth(['ADMIN']);
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();
    const course = await prisma.course.update({
      where: { id },
      data: { status: body.status },
    });
    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // SEC-03: TEACHER أو ADMIN فقط
  const { user, error } = await requireAuth(['TEACHER', 'ADMIN']);
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, thumbnail, category, price, videoUrl, status } = body;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
    }

    // SEC-03: تحقق من الملكية — المعلم يقدر يعدل كورساته بس
if (user!.role !== 'ADMIN' && (course as any).instructorId !== user!.id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(category !== undefined && { category }),
        ...(price !== undefined && { price: Number(price) }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // SEC-03: ADMIN only
  const { user, error } = await requireAuth(['ADMIN']);
  if (error) return error;

  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
    }
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Course deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}