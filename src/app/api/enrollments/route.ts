// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { requireAuth } from '@/lib/auth';

// export async function POST(request: Request) {
//   const { user, error } = await requireAuth(['STUDENT']);
//   if (error) return error;

//   try {
//     const { courseId } = await request.json();

//     if (!courseId) {
//       return NextResponse.json(
//         { success: false, message: 'courseId is required' },
//         { status: 400 }
//       );
//     }

//     const course = await prisma.course.findUnique({ where: { id: courseId } });
//     if (!course) {
//       return NextResponse.json(
//         { success: false, message: 'Course not found' },
//         { status: 404 }
//       );
//     }

//     // BL-04: منع التسجيل في كورسات مدفوعة بدون payment
//     if (Number(course.price) > 0) {
//       return NextResponse.json(
//         { success: false, message: 'Payment required to enroll in this course' },
//         { status: 402 }
//       );
//     }

//     const existing = await prisma.enrollment.findUnique({
//       where: { studentId_courseId: { studentId: user!.id, courseId } },
//     });
//     if (existing) {
//       return NextResponse.json(
//         { success: false, message: 'Already enrolled' },
//         { status: 409 }
//       );
//     }

//     const enrollment = await prisma.enrollment.create({
//       data: { studentId: user!.id, courseId },
//     });

//     return NextResponse.json({ success: true, data: enrollment }, { status: 201 });
//   } catch (err) {
//     console.error('[POST /api/enrollments]', err);
//     return NextResponse.json(
//       { success: false, message: 'Failed to enroll' },
//       { status: 500 }
//     );
//   }
// }

// export async function GET() {
//   const { user, error } = await requireAuth(['STUDENT']);
//   if (error) return error;

//   try {
//     const enrollments = await prisma.enrollment.findMany({
//       where: { studentId: user!.id },
//       include: { course: true },
//     });

//     const courses = enrollments.map((e) => e.course);
//     return NextResponse.json({ success: true, data: courses }, { status: 200 });
//   } catch (err) {
//     console.error('[GET /api/enrollments]', err);
//     return NextResponse.json(
//       { success: false, message: 'Failed to fetch enrollments' },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('session-token')?.value;
}

export async function POST(request: Request) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { courseId } = await request.json();
    const response = await axios.post(
      `${API_URL}/enrollments`,
      { courseId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const message = axiosError.response?.data?.message || 'Failed to enroll';
    const status = axiosError.response?.status || 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function GET() {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await axios.get(
      `${API_URL}/enrollments/my`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const message = axiosError.response?.data?.message || 'Failed to fetch enrollments';
    const status = axiosError.response?.status || 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}