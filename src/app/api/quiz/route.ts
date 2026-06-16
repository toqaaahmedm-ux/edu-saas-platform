import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    const cookieStore = await cookies();
    const token = cookieStore.get('session-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = courseId
      ? `${process.env.NEXT_PUBLIC_API_URL}/quiz?courseId=${courseId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/quiz`;

    const res = await fetch(url, {
      headers: { Cookie: `session-token=${token}` },
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