import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session-token")?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data ?? data?.user ?? null;
  } catch {
    return null;
  }
}

export async function requireAuth(allowedRoles?: string[]) {
  const user = await getAuthUser();

  if (!user) {
    return {
      user: null,
      error: Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      user: null,
      error: Response.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}