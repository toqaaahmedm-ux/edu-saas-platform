// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { requireAuth } from '@/lib/auth';

// export const dynamic = 'force-dynamic';

// export async function GET(
//   request: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const course = await prisma.course.findUnique({ where: { id } });
//     if (!course) {
//       return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
//     }
//     return NextResponse.json({ success: true, data: course }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
//   }
// }

// export async function PATCH(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   // SEC-03: ADMIN only
//   const { user, error } = await requireAuth(['ADMIN']);
//   if (error) return error;

//   try {
//     const { id } = await params;
//     const body = await req.json();
//     const course = await prisma.course.update({
//       where: { id },
//       data: { status: body.status },
//     });
//     return NextResponse.json(course);
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
//   }
// }

// export async function PUT(
//   request: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   // SEC-03: TEACHER أو ADMIN فقط
//   const { user, error } = await requireAuth(['TEACHER', 'ADMIN']);
//   if (error) return error;

//   try {
//     const { id } = await params;
//     const body = await request.json();
//     const { title, description, thumbnail, category, price, videoUrl, status } = body;

//     const course = await prisma.course.findUnique({ where: { id } });
//     if (!course) {
//       return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
//     }

//     // SEC-03: تحقق من الملكية — المعلم يقدر يعدل كورساته بس
// if (user!.role !== 'ADMIN' && (course as any).instructorId !== user!.id) {
//       return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
//     }

//     const updated = await prisma.course.update({
//       where: { id },
//       data: {
//         ...(title && { title }),
//         ...(description && { description }),
//         ...(thumbnail !== undefined && { thumbnail }),
//         ...(category !== undefined && { category }),
//         ...(price !== undefined && { price: Number(price) }),
//         ...(videoUrl !== undefined && { videoUrl }),
//         ...(status && { status }),
//       },
//     });

//     return NextResponse.json({ success: true, data: updated }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
//   }
// }

// export async function DELETE(
//   request: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   // SEC-03: ADMIN only
//   const { user, error } = await requireAuth(['ADMIN']);
//   if (error) return error;

//   try {
//     const { id } = await params;
//     const course = await prisma.course.findUnique({ where: { id } });
//     if (!course) {
//       return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
//     }
//     await prisma.course.delete({ where: { id } });
//     return NextResponse.json({ success: true, message: 'Course deleted successfully' }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
//   }
// } 
import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('session-token')?.value;
}

// GET — جلب كورس بالـ ID (Public)
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

// PUT — تعديل كورس (TEACHER أو ADMIN)
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

// PATCH — تغيير status (ADMIN فقط)
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

// DELETE — حذف كورس (ADMIN فقط)
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