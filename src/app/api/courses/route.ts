import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await axios.get(`${API_URL}/courses`);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const message = axiosError.response?.data?.message || 'Failed to fetch courses';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session-token')?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await axios.post(
      `${API_URL}/courses`,
      body,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const message = axiosError.response?.data?.message || 'Failed to create course';
    const status = axiosError.response?.status || 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}