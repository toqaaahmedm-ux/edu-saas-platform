import { NextResponse } from 'next/server';
import { QUIZ_QUESTIONS } from '@/data/quizzes.data';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  return NextResponse.json({ success: true, data: QUIZ_QUESTIONS }, { status: 200 });
}