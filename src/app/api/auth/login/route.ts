// // import { NextResponse } from 'next/server';
// // import { apiClient } from '@/lib/api/client';
// // import { cookies } from 'next/headers';
// // import { AxiosError } from 'axios';

// // export async function POST(request: Request) {
// //   try {
// //     const { email, password } = await request.json();

// //     if (!email || !password) {
// //       return NextResponse.json(
// //         { success: false, message: 'Email and password are required' },
// //         { status: 400 }
// //       );
// //     }

// //     const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;

// //     const response = await apiClient.post(
// //       '/auth/login',
// //       { email, password },
// //       { headers: tenantId ? { 'x-tenant-id': tenantId } : {} }
// //     );

// //     const { data, accessToken } = response.data;

// //     const cookieStore = await cookies();
// //     const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

// //     if (accessToken) {
// //       cookieStore.set('session-token', accessToken, {
// //         httpOnly: false, // ✅ تغيير
// //         secure: process.env.NODE_ENV === 'production',
// //         sameSite: 'lax',
// //         expires: expiresAt,
// //         path: '/',
// //       });
// //     }

// //     if (data?.role) {
// //       cookieStore.set('user-role', data.role, {
// //         httpOnly: false, //
// //         secure: process.env.NODE_ENV === 'production',
// //         sameSite: 'lax',
// //         expires: expiresAt,
// //         path: '/',
// //       });
// //     }

// //     return NextResponse.json({ success: true, data });
// //   } catch (error) {
// //     const axiosError = error as AxiosError<any>;
// //     const message = axiosError.response?.data?.message || 'Invalid credentials';
// //     const status = axiosError.response?.status || 500;
// //     return NextResponse.json({ success: false, message }, { status });
// //   }
// // }

// import { NextResponse } from 'next/server';
// import { apiClient } from '@/lib/api/client';
// import { cookies } from 'next/headers';
// import { AxiosError } from 'axios';

// export async function POST(request: Request) {
//   try {
//     const { email, password } = await request.json();

//     if (!email || !password) {
//       return NextResponse.json(
//         { success: false, message: 'Email and password are required' },
//         { status: 400 }
//       );
//     }

//     const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;

//     const response = await apiClient.post(
//       '/auth/login',
//       { email, password },
  

// { headers: (tenantId && email !== 'superadmin@platform.com') ? { 'x-tenant-id': tenantId } : {} }
//     );

//     const { data, accessToken } = response.data;

//     const cookieStore = await cookies();
//     const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

//     if (accessToken) {
//       cookieStore.set('session-token', accessToken, {
//         httpOnly: true,
        
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'lax',
//         expires: expiresAt,
//         path: '/',
//       });
//     }

//     //  AUTH-02: مفيش user-role cookie — الـ role بييجي من السيرفر بس

//     return NextResponse.json({ success: true, data });
//   } catch (error) {
//     const axiosError = error as AxiosError<any>;
//     const message = axiosError.response?.data?.message || 'Invalid credentials';
//     const status = axiosError.response?.status || 500;
//     return NextResponse.json({ success: false, message }, { status });
//   }
// }

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

    // ✅ SuperAdmin بيلوجن بدون tenantId
    const isSuperAdmin = email === 'superadmin@platform.com';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (TENANT_ID && !isSuperAdmin) {
      headers['x-tenant-id'] = TENANT_ID;
    }

    // ✅ fetch مباشرة بدل apiClient عشان نتحكم في الـ headers
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
    const { data, accessToken } = result;

    const cookieStore = await cookies();
    const expiresAt = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);

    if (accessToken) {
      cookieStore.set('session-token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}