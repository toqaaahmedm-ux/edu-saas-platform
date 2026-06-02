import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quizId, answers } = body;

    if (!quizId || !answers) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const response = await apiClient.post(`/quiz/${quizId}/submit`, { answers });
    return NextResponse.json(response.data, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}