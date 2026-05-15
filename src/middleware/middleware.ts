import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// (Fix NEW-06)
const ROLE_ROUTES: Record<string, string> = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student', 
};

export function middleware(request: NextRequest) {
  const userRole = request.cookies.get('user-role')?.value;
  const { pathname } = request.nextUrl;

  const protectedPaths = Object.values(ROLE_ROUTES);
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

  // لو مش مسجل وبيحاول يدخل صفحة محظورة.. يرجع للوجن
  if (!userRole && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // لو مسجل ورايح للوجن أو للهوم.. نوديه بيته علطول
  if (userRole && (pathname === '/' || pathname === '/login' || pathname === '/register')) {
    const dashboard = ROLE_ROUTES[userRole] || '/';
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // حماية الأدوار: لو طالب بيحاول يدخل صفحة مدرس أو أدمن
  if (userRole) {
    const allowedPath = ROLE_ROUTES[userRole];
    const isAccessingOtherRole = protectedPaths.some(path => 
      pathname.startsWith(path) && path !== allowedPath
    );

    if (isAccessingOtherRole) {
       return NextResponse.redirect(new URL(allowedPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // الماتشر ده بيراقب كل حاجة ما عدا الصور والملفات التقنية
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
