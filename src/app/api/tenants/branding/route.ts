import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get("subdomain");

  if (!subdomain) {
    return NextResponse.json({ error: "subdomain is required" }, { status: 400 });
  }

  try {
    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/tenants/${subdomain}/branding`
    );

    if (!backendRes.ok) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/tenants/branding]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}