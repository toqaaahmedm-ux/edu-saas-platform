import { NextResponse } from 'next/server';
import { QUIZ_QUESTIONS } from '@/data/quizzes.data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    // دلوقتي بنرجع نفس الأسئلة — لما تضيف quizzes في DB هنفلتر بـ courseId
    return NextResponse.json({ data: QUIZ_QUESTIONS });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}