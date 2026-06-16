// import { cookies } from "next/headers";
// import { prisma } from "@/lib/prisma";

// export async function getAuthUser() {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("session-token")?.value;

//   if (!token) return null;

//   const session = await prisma.session.findUnique({
//     where: { token },
//     include: { user: true },
//   });

//   if (!session || session.expiresAt < new Date()) return null;

//   return session.user;
// }

// export async function requireAuth(allowedRoles?: string[]) {
//   const user = await getAuthUser();

//   if (!user) {
//     return {
//       user: null,
//       error: Response.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       ),
//     };
//   }

//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return {
//       user: null,
//       error: Response.json(
//         { success: false, message: "Forbidden" },
//         { status: 403 }
//       ),
//     };
//   }

//   return { user, error: null };
// }
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session-token")?.value;

  if (!token) return null;

  const tokenHash = hashToken(token);

  const session = await prisma.session.findUnique({
    where: { token: tokenHash },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return session.user;
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