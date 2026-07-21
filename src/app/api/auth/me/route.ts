import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // BE-L04: /me instead of /auth/me since it uses the richer path
    // that reads straight from the DB via usersService.findById
 const res = await fetch(`${API_URL}/me`, {
      headers: { Cookie: `session-token=${token}` },
    });

    if (res.status === 401) {
      const refreshToken = cookieStore.get('refresh-token')?.value;
      if (!refreshToken) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      }

      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { Cookie: `refresh-token=${refreshToken}` },
      });

      if (!refreshRes.ok) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      }

      const setCookie = refreshRes.headers.get('set-cookie');
      const match = setCookie?.match(/session-token=([^;]+)/);
      const newToken = match?.[1];

      if (!newToken) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      }

     const retryRes = await fetch(`${API_URL}/me`, {
        headers: { Cookie: `session-token=${newToken}` },
      });

      if (!retryRes.ok) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      }

      const data = await retryRes.json();

      const response = NextResponse.json({ success: true, data });
      response.cookies.set('session-token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60,
        path: '/',
      });
      return response;
    }

    if (!res.ok) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch user' }, { status: 500 });
  }
}