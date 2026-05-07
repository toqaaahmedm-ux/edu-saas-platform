import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // نجيب الـ role من الكوكيز عشان نحدد صلاحيات اليوزر
  const userRole = request.cookies.get('user-role')?.value;
  const { pathname } = request.nextUrl;

  // قائمة الصفحات اللي محتاجة تسجيل دخول
  const protectedPaths = ['/admin', '/teacher', '/student'];
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

  // لو اليوزر مش مسجل دخول وبيحاول يدخل صفحة محظورة -> يروح للوجن فوراً
  if (!userRole && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // لو مسجل دخول وبيحاول يروح لصفحة اللوجن يدوي -> نرجعه لبيئته
  if (userRole && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL(`/${userRole.toLowerCase()}`, request.url));
  }

  // التأكد إن كل يوزر في مكانه الصح (حماية الأدوار)
  if (userRole) {
    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(`/${userRole.toLowerCase()}`, request.url));
    }
    if (pathname.startsWith('/teacher') && userRole !== 'TEACHER') {
      return NextResponse.redirect(new URL(`/${userRole.toLowerCase()}`, request.url));
    }
    if (pathname.startsWith('/student') && userRole !== 'STUDENT') {
      return NextResponse.redirect(new URL(`/${userRole.toLowerCase()}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // الماتشر هنا بيغطي كل الصفحات الحساسة عشان نمنع أي دخول غير قانوني (Fix BUG-02)
  matcher: [
    '/admin', '/admin/:path*',
    '/teacher', '/teacher/:path*',
    '/student', '/student/:path*',
    '/login', '/register'
  ],
};
