import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
  // BL-01: check auth before returning the questions
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    // BL-01: proxy to NestJS instead of static mockData
    const url = courseId
      ? `${process.env.NEXT_PUBLIC_API_URL}/quiz?courseId=${courseId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/quiz`;

    const res = await fetch(url, {

      headers: { cookie: request.headers.get('cookie') || '' },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}