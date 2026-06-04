// updated
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    console.error('[GET /api/courses/:id]', error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const course = await prisma.course.update({
      where: { id },
      data: { status: body.status },
    });
    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, instructor, thumbnail, category, price, lessonsCount, videoUrl, status } = body;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        title,
        description,
        instructor: instructor || '',
        thumbnail: thumbnail || '',
        category: category || '',
        price: Number(price) || 0,
        lessonsCount: Number(lessonsCount) || 0,
        videoUrl: videoUrl || '',
        status: status || course.status || 'draft',
      }
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/courses/:id]', error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
    }
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Course deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/courses/:id]', error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}