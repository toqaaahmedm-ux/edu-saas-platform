import { NextResponse } from "next/server";

// Called from the tenant's own subdomain (not localhost:3000), so any
// cookie we set here is correctly scoped to this origin. Takes the
// short-lived token issued by /auth/impersonate and turns it into the
// same httpOnly session-token cookie a normal login would set.
export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();
    if (!accessToken) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

 const res = NextResponse.json({ success: true });
    res.cookies.set('session-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60,
      path: '/',
    });

    // Critical: clear any stale refresh-token left over from a real
    // login on this subdomain (e.g. a previous test account). If we
    // don't, middleware.ts's tryRefresh() will silently use that old
    // refresh-token to reissue a session-token for the WRONG user,
    // overwriting the impersonation session we just set above.
    res.cookies.delete('refresh-token');

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}