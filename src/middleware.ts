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

    if (!decoded.exp || Date.now() >= decoded.exp * 1000) {
      return null;
    }

    return decoded.role || null;
  } catch {
    return null;
  }
}

// ✅ جديد — بيجرب يعمل refresh وبيرجع الـ access token الجديد
async function tryRefresh(request: NextRequest): Promise<string | null> {
  const refreshToken = request.cookies.get('refresh-token')?.value;
  if (!refreshToken) return null;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refresh-token=${refreshToken}` },
    });

    if (!res.ok) return null;

    // الباك-إند بيبعت الـ access token الجديد في set-cookie
    const setCookie = res.headers.get('set-cookie');
    if (!setCookie) return null;

    // استخرج الـ token من الـ set-cookie header
    const match = setCookie.match(/session-token=([^;]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session-token')?.value;
  const userRole = token ? getRoleFromToken(token) : null;
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/admin', '/teacher', '/student', '/superadmin'];
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

  // ✅ لو مفيش role صالح على route محمي — جرب الـ refresh الأول
  if (!userRole && isProtectedRoute) {
    const newAccessToken = await tryRefresh(request);

    if (newAccessToken) {
      // ✅ الـ refresh نجح — كمّل للصفحة وحط الـ token الجديد في الـ cookie
      const newRole = getRoleFromToken(newAccessToken);
      const response = NextResponse.next();
      response.cookies.set('session-token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60,
        path: '/',
      });

      // لو الـ role اتغير، وجّهه للصفحة الصح
      if (newRole && ROLE_ROUTES[newRole]) {
        const targetDashboard = ROLE_ROUTES[newRole];
        if (!pathname.startsWith(targetDashboard)) {
          return NextResponse.redirect(new URL(targetDashboard, request.url));
        }
      }

      return response;
    }

    // ✅ الـ refresh فشل — امسح الـ cookies وروح للـ login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session-token');
    response.cookies.delete('refresh-token');
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