import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userRole = request.cookies.get('user-role')?.value;
  const { pathname } = request.nextUrl;

  // 1. لو مفيش Role (مش مسجل دخول) وهو رايح لصفحة محمية
  if (!userRole) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. حماية صفحات الأدمن (ADMIN فقط)
  if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL(`/${userRole.toLowerCase()}`, request.url));
  }

  // 3. حماية صفحات المدرس (TEACHER فقط)
  if (pathname.startsWith('/teacher') && userRole !== 'TEACHER') {
    return NextResponse.redirect(new URL(`/${userRole.toLowerCase()}`, request.url));
  }

  // 4. حماية صفحات الطالب (STUDENT فقط)
  if (pathname.startsWith('/student') && userRole !== 'STUDENT') {
    return NextResponse.redirect(new URL(`/${userRole.toLowerCase()}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // التعديل هنا: ضفنا المسارات الأساسية والمسارات اللي بعدها (+:) عشان نقفل الثغرة تماماً
  matcher: [
    '/admin', '/admin/:path+',
    '/teacher', '/teacher/:path+',
    '/student', '/student/:path+',
  ],
};
