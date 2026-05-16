import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// [تقرير 1 - صفحة 5]: صلحت المسارات هنا لتطابق الـ App Structure (Fix NEW-05 & NEW-06)
const ROLE_ROUTES: Record<string, string> = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student/dashboard', // [Fix]: المسار الحقيقي للطالب
};

export function middleware(request: NextRequest) {
  // بنجيب الدور من الكوكيز (اللي بنبعتها من صفحة اللوجن)
  const userRole = request.cookies.get('user-role')?.value;
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/admin', '/teacher', '/student'];
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

  // 1. حماية الدخول: لو مش مسجل وبيحاول يدخل أي صفحة محمية.. (Fix Authentication)
  if (!userRole && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. توجيه المسجلين: لو مسجل ورايح للوجن.. نوديه "مكانه الصح" علطول (Fix Redirect Loop)
  if (userRole && (pathname === '/' || pathname === '/login' || pathname === '/register')) {
    const dashboard = ROLE_ROUTES[userRole] || '/';
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // 3. [تقرير 2 - Security]: حماية الأدوار "الجذرية" (Role Authorization)
  // [Fix]: هنا بنمنع الطالب يدخل صفحة الأدمن حتى لو كتب العنوان بإيده
  if (userRole) {
    if (userRole === 'STUDENT' && (pathname.startsWith('/admin') || pathname.startsWith('/teacher'))) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
    if (userRole === 'TEACHER' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/teacher', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
