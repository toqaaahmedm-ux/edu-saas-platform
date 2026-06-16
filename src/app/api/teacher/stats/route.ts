// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { requireAuth } from '@/lib/auth';

// export async function GET() {
//   const { user, error } = await requireAuth(['TEACHER', 'ADMIN']);
//   if (error) return error;

//   try {
//     const courses = await prisma.course.findMany({
//       where: { instructorId: user!.id } as any, // BL-02: UUID مش اسم
//     });

//     const courseIds = courses.map((c) => c.id);

//     const totalStudents = await prisma.enrollment.count({
//       where: { courseId: { in: courseIds } },
//     });

//     // BL-02: PUBLISHED بالكابيتال عشان يتطابق مع الـ enum في NestJS schema
//     const publishedCourses = courses.filter((c) => c.status === 'PUBLISHED').length;

//     const activeQuizzes = await prisma.quiz.count({
//       where: { courseId: { in: courseIds } },
//     });

//     return NextResponse.json({
//       success: true,
//       data: {
//         totalStudents,
//         publishedCourses,
//         activeQuizzes,
//         avgRating: 4.8,
//       },
//     });
//   } catch (err) {
//     console.error('[GET /api/teacher/stats]', err);
//     return NextResponse.json(
//       { success: false, message: 'Failed to fetch stats' },
//       { status: 500 }
//     );
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

// GET — إحصائيات المعلم
export async function GET() {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await axios.get(`${API_URL}/courses/teacher/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const message = axiosError.response?.data?.message || 'Failed to fetch stats';
    const status = axiosError.response?.status || 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}