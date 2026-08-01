import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

const isSuperAdmin = email === 'superadmin@platform.com';
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
};

if (!isSuperAdmin) {
  // Resolve the tenant from whichever subdomain the request actually
  // came in on, instead of always trusting a fixed env var — otherwise
  // logging in from "design-school.localhost" would silently log you
  // into "edusaas-academy" (or whichever tenant NEXT_PUBLIC_TENANT_ID
  // points to) instead.
  const host = request.headers.get('host') || '';
  const subdomain = host.split('.')[0];
  const isBareLocalhost = subdomain === 'localhost' || subdomain === host; // no dot at all

  let resolvedTenantId: string | undefined;

  if (!isBareLocalhost && subdomain !== 'www') {
    try {
      const resolveRes = await fetch(`${API_URL}/tenants/resolve/${subdomain}`);
      if (resolveRes.ok) {
        const resolveJson = await resolveRes.json();
        resolvedTenantId = resolveJson?.data?.tenantId ?? resolveJson?.tenantId;
      }
    } catch {
      // fall through to env var below
    }
  }

  // Fallback for plain "localhost" dev testing only — matches the
  // behavior client.ts already relies on elsewhere.
  headers['x-tenant-id'] = resolvedTenantId ?? TENANT_ID ?? '';
}
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { success: false, message: err.message || 'Invalid credentials' },
        { status: response.status }
      );
    }

    const result = await response.json();
    const { data } = result;

    // BE-H04 FIX: read tokens from the set-cookie headers instead of the body
    // because the backend doesn't send them in the body at all
    const setCookieHeader = response.headers.get('set-cookie') || '';
    const accessTokenMatch = setCookieHeader.match(/session-token=([^;]+)/);
    const refreshTokenMatch = setCookieHeader.match(/refresh-token=([^;]+)/);
    const accessToken = accessTokenMatch?.[1];
    const refreshToken = refreshTokenMatch?.[1];

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'Authentication failed - no token received' },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ success: true, data });
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookies.set('session-token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });

    if (refreshToken) {
      res.cookies.set('refresh-token', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
    }

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}