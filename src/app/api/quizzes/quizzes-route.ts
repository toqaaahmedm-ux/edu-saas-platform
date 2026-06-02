import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await apiClient.get(`/quiz/${params.id}`);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}