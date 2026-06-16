// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { requireAuth } from '@/lib/auth';

// export async function GET() {
//   const { user, error } = await requireAuth(['TEACHER', 'ADMIN']);
//   if (error) return error;

//   try {
//     const courses = await prisma.course.findMany({
//       where: { instructorId: user!.id } as any, // BL-02: UUID مش اسم
//       orderBy: { createdAt: 'desc' },
//     });

//     return NextResponse.json({ success: true, data: courses });
//   } catch (err) {
//     console.error('[GET /api/teacher/courses]', err);
//     return NextResponse.json(
//       { success: false, message: 'Failed to fetch courses' },
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

// GET — جلب كورسات المعلم
export async function GET() {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await axios.get(`${API_URL}/courses/teacher/my-courses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const message = axiosError.response?.data?.message || 'Failed to fetch courses';
    const status = axiosError.response?.status || 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}