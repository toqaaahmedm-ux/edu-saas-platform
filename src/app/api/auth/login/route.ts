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
    if (TENANT_ID && !isSuperAdmin) {
      headers['x-tenant-id'] = TENANT_ID;
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
    const { data, accessToken, refreshToken } = result;

    // ✅ بنبعت الـ cookies في الـ response headers مباشرة
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