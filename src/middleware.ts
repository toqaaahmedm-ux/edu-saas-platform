import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

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

    const setCookie = res.headers.get('set-cookie');
    if (!setCookie) return null;

    const match = setCookie.match(/session-token=([^;]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Strips a leading /en or /ar so the existing role-check logic below can
// keep comparing against plain paths like "/admin" regardless of locale.
function stripLocale(pathname: string): { locale: string; rest: string } {
  const match = pathname.match(/^\/(en|ar)(\/.*)?$/);
  if (match) {
    return { locale: match[1], rest: match[2] || '/' };
  }
  return { locale: routing.defaultLocale, rest: pathname };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let next-intl handle locale detection/redirect for anything that
  // doesn't already have a recognized locale prefix. Once a request has
  // a locale prefix, we take over below so the existing auth/role logic
  // still runs on every navigation.
  const hasLocalePrefix = /^\/(en|ar)(\/|$)/.test(pathname);
  if (!hasLocalePrefix) {
    return intlMiddleware(request);
  }

  const { locale, rest: plainPathname } = stripLocale(pathname);
  const localePrefix = `/${locale}`;

  const token = request.cookies.get('session-token')?.value;
  const userRole = token ? getRoleFromToken(token) : null;

  const protectedPaths = ['/admin', '/teacher', '/student', '/superadmin'];
  const isProtectedRoute = protectedPaths.some((path) => plainPathname.startsWith(path));

  if (!userRole && isProtectedRoute) {
    const newAccessToken = await tryRefresh(request);

    if (newAccessToken) {
      const newRole = getRoleFromToken(newAccessToken);
      const response = NextResponse.next();
      response.cookies.set('session-token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60,
        path: '/',
      });

      if (newRole && ROLE_ROUTES[newRole]) {
        const targetDashboard = ROLE_ROUTES[newRole];
        if (!plainPathname.startsWith(targetDashboard)) {
          return NextResponse.redirect(new URL(`${localePrefix}${targetDashboard}`, request.url));
        }
      }

      return response;
    }

    const response = NextResponse.redirect(new URL(`${localePrefix}/login`, request.url));
    response.cookies.delete('session-token');
    response.cookies.delete('refresh-token');
    return response;
  }

  if (userRole && (plainPathname === '/' || plainPathname === '/login' || plainPathname === '/register')) {
    const dashboard = ROLE_ROUTES[userRole] || '/';
    return NextResponse.redirect(new URL(`${localePrefix}${dashboard}`, request.url));
  }

  if (userRole) {
    if (userRole === 'STUDENT' && (plainPathname.startsWith('/admin') || plainPathname.startsWith('/teacher') || plainPathname.startsWith('/superadmin'))) {
      return NextResponse.redirect(new URL(`${localePrefix}/student/dashboard`, request.url));
    }
    if (userRole === 'TEACHER' && (plainPathname.startsWith('/admin') || plainPathname.startsWith('/superadmin'))) {
      return NextResponse.redirect(new URL(`${localePrefix}/teacher`, request.url));
    }
    if (userRole === 'ADMIN' && plainPathname.startsWith('/superadmin')) {
      return NextResponse.redirect(new URL(`${localePrefix}/admin`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
