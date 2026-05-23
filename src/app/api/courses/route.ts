import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: courses }, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/courses]', error.message);
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, instructor, thumbnail, category, price, lessonsCount, videoUrl, status } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: 'Title and description are required' },
        { status: 400 }
      );
    }

    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        instructor: instructor || '',
        thumbnail: thumbnail || '',
        category: category || '',
        price: Number(price) || 0,
        lessonsCount: Number(lessonsCount) || 0,
        videoUrl: videoUrl || '',
        status: status || 'draft',
        enrollmentCount: 0,
      }
    });

    return NextResponse.json({ success: true, data: newCourse }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/courses]', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}