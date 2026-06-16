// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { requireAuth } from '@/lib/auth';

// // POST — حفظ شهادة جديدة
// export async function POST(request: Request) {
//   const { user, error } = await requireAuth(['STUDENT']);
//   if (error) return error;

//   try {
//     const { examName, institutionName, facultyName } = await request.json();

//     // جلب أول كورس الطالب enrolled فيه
//     const enrollment = await prisma.enrollment.findFirst({
//       where: { studentId: user!.id },
//       orderBy: { enrolledAt: 'asc' },
//     });

//     if (!enrollment) {
//       return NextResponse.json(
//         { success: false, message: 'No enrolled courses found' },
//         { status: 404 }
//       );
//     }

//     const courseId = enrollment.courseId;

//     // تأكد إن الطالب مش عنده شهادة لنفس الكورس
//     const existing = await prisma.certificate.findFirst({
//       where: { studentId: user!.id, courseId },
//     });

//     if (existing) {
//       return NextResponse.json({ success: true, data: existing }, { status: 200 });
//     }

//     const certificate = await prisma.certificate.create({
//       data: {
//         studentId: user!.id,
//         courseId,
//         examName: examName || "General Medical Anatomy",
//         institutionName: institutionName || "Ain Shams University",
//         facultyName: facultyName || "Faculty of Medicine - ASU",
//       },
//     });

//     return NextResponse.json({ success: true, data: certificate }, { status: 201 });
//   } catch (err) {
//     console.error('[POST /api/certificates]', err);
//     return NextResponse.json(
//       { success: false, message: 'Failed to save certificate' },
//       { status: 500 }
//     );
//   }
// }

// // GET — جلب شهادات الطالب
// export async function GET() {
//   const { user, error } = await requireAuth(['STUDENT']);
//   if (error) return error;

//   try {
//     const certificates = await prisma.certificate.findMany({
//       where: { studentId: user!.id },
//       include: { course: true },
//       orderBy: { issuedAt: 'desc' },
//     });

//     return NextResponse.json({ success: true, data: certificates }, { status: 200 });
//   } catch (err) {
//     console.error('[GET /api/certificates]', err);
//     return NextResponse.json(
//       { success: false, message: 'Failed to fetch certificates' },
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

// GET — جلب شهادات الطالب
export async function GET() {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await axios.get(`${API_URL}/certificates/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const message = axiosError.response?.data?.message || 'Failed to fetch certificates';
    const status = axiosError.response?.status || 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

// POST — حفظ شهادة جديدة
export async function POST(request: Request) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await axios.post(`${API_URL}/certificates/my`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const message = axiosError.response?.data?.message || 'Failed to save certificate';
    const status = axiosError.response?.status || 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}