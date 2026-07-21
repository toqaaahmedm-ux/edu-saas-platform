import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const cookieHeader = request.headers.get('cookie') || '';

    const backendRes = await fetch(`${API_URL}/auth/impersonate/${userId}`, {
      method: 'POST',
      headers: { Cookie: cookieHeader },
    });

    if (!backendRes.ok) {
      const err = await backendRes.json();
      return NextResponse.json({ error: err.message || 'Impersonation failed' }, { status: backendRes.status });
    }

    const result = await backendRes.json();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}