// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import bcrypt from 'bcryptjs';
// import { cookies } from 'next/headers';
// import crypto from 'crypto';

// export async function POST(request: Request) {
//   try {
//     const { email, password } = await request.json();

//     if (!email || !password) {
//       return NextResponse.json(
//         { success: false, message: 'Email and password are required' },
//         { status: 400 }
//       );
//     }

//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid email or password' },
//         { status: 401 }
//       );
//     }

//     const isValid = await bcrypt.compare(password, user.hashedPassword);
//     if (!isValid) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid email or password' },
//         { status: 401 }
//       );
//     }

//     const token = crypto.randomBytes(32).toString('hex');
//     const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

//     await prisma.session.create({
//       data: { userId: user.id, token, expiresAt },
//     });

//     const cookieStore = await cookies();

//     cookieStore.set('session-token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       expires: expiresAt,
//       path: '/',
//     });

//     // SEC-01: user-role من السيرفر مش من document.cookie في المتصفح
//     cookieStore.set('user-role', user.role, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       expires: expiresAt,
//       path: '/',
//     });

//     return NextResponse.json({
//       success: true,
//       data: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     console.error('[POST /api/auth/login]', error);
//     return NextResponse.json(
//       { success: false, message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';
import { cookies } from 'next/headers';
import { AxiosError } from 'axios';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const response = await apiClient.post('/auth/login', { email, password });
    const { data, accessToken } = response.data;

    const cookieStore = await cookies();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

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
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const message = axiosError.response?.data?.message || 'Invalid credentials';
    const status = axiosError.response?.status || 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}