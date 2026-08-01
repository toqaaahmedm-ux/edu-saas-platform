
import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('session-token')?.value;
}

// GET — fetch a course by ID (Public)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const response = await axios.get(`${API_URL}/courses/${id}`);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const message = axiosError.response?.data?.message || 'Course not found';
    const status = axiosError.response?.status || 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

// PUT — update a course (TEACHER or ADMIN)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const response = await axios.put(`${API_URL}/courses/${id}`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const message = axiosError.response?.data?.message || 'Failed to update course';
    const status = axiosError.response?.status || 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

// PATCH — change status (ADMIN only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const response = await axios.patch(`${API_URL}/courses/${id}/status`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const message = axiosError.response?.data?.message || 'Failed to update status';
    const status = axiosError.response?.status || 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

// DELETE — delete a course (ADMIN only)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const response = await axios.delete(`${API_URL}/courses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const message = axiosError.response?.data?.message || 'Failed to delete course';
    const status = axiosError.response?.status || 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}