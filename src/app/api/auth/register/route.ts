import { NextResponse } from "next/server";

// Only these roles can self-register. Admins/SuperAdmins should never
// be created through the public signup form — that's an invite-only
// or manually-provisioned flow.
const ALLOWED_SELF_REGISTER_ROLES = ["STUDENT", "TEACHER"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    // Previously we silently dropped the role and forwarded nothing,
    // so every signup ended up as STUDENT by default on the backend.
    // Now we actually read it, validate it, and pass it along.
    const requestedRole = typeof role === "string" ? role.toUpperCase() : "STUDENT";
    if (!ALLOWED_SELF_REGISTER_ROLES.includes(requestedRole)) {
      return NextResponse.json(
        { error: "Invalid role for self-registration" },
        { status: 400 }
      );
    }

    // Registration happens on a tenant's subdomain (e.g. ainshams.yourapp.com),
    // so we pull the subdomain straight out of the Host header. This was
    // missing entirely before — the backend had no idea which tenant a
    // new user belonged to.
    const host = request.headers.get("host") || "";
    const subdomain = host.split(".")[0];

    if (!subdomain || subdomain === "www" || subdomain === "yourapp") {
      return NextResponse.json(
        { error: "Registration must happen on a tenant subdomain" },
        { status: 400 }
      );
    }

    // Turn the subdomain into a real tenant UUID before calling the
    // backend — auth.controller.ts reads x-tenant-id as a raw UUID,
    // it has no idea what to do with a subdomain string.
    const resolveRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/tenants/resolve/${subdomain}`
    );

    if (!resolveRes.ok) {
      return NextResponse.json(
        { error: "Unknown tenant" },
        { status: 404 }
      );
    }

   const resolveJson = await resolveRes.json();
const tenantId = resolveJson?.data?.tenantId ?? resolveJson?.tenantId;

    // SEC-02: this route is just a proxy to NestJS — the actual user
    // creation and password hashing happens on the backend.
    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": tenantId, // now a real UUID, matches what auth.controller expects
        },
        body: JSON.stringify({ name, email, password, role: requestedRole }),
      }
    );

    if (!backendRes.ok) {
      const err = await backendRes.json();
      return NextResponse.json(
        { error: err.message || "Registration failed" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );

  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}