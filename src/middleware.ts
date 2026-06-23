import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROLE_ROUTES: Record<string, string> = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student/dashboard',
  SUPER_ADMIN: '/superadmin',
};

function getRoleFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const decoded = JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'));

    // SEC-04 FIX: ده مش تحقق توقيع حقيقي (مينفعش من غير الـ secret هنا في
    // الـ edge middleware) — التحقق الكامل من التوقيع لازم يفضل مسؤولية
    // الباك إند على كل request. لكن كحد أدنى، لازم نرفض أي توكن منتهي
    // الصلاحية هنا في الـ middleware، عشان منعرضش route محمي لمستخدم
    // معاه توكن قديم لحد ما الباك إند يرفضه لاحقاً.
    if (!decoded.exp || Date.now() >= decoded.exp * 1000) {
      return null;
    }

    return decoded.role || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session-token')?.value;
  const userRole = token ? getRoleFromToken(token) : null;
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/admin', '/teacher', '/student', '/superadmin'];
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

  if (!userRole && isProtectedRoute) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    // توكن منتهي/فاسد وموجود في الكوكي — نمسحه عشان منكررش نفس عملية
    // الفك والفحص الفاشلة على كل request جاي بعد كده
    if (token) {
      response.cookies.delete('session-token');
    }
    return response;
  }

  if (userRole && (pathname === '/' || pathname === '/login' || pathname === '/register')) {
    const dashboard = ROLE_ROUTES[userRole] || '/';
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  if (userRole) {
    if (userRole === 'STUDENT' && (pathname.startsWith('/admin') || pathname.startsWith('/teacher') || pathname.startsWith('/superadmin'))) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
    if (userRole === 'TEACHER' && (pathname.startsWith('/admin') || pathname.startsWith('/superadmin'))) {
      return NextResponse.redirect(new URL('/teacher', request.url));
    }
    if (userRole === 'ADMIN' && pathname.startsWith('/superadmin')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};