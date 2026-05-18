import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role } = body;

    // هنا السيرفر بيستلم الـ role وبيهندلها في الكوكيز بشكل آمن ومشفر (HttpOnly) من جوه السيرفر نفسه
    const response = NextResponse.json(
      { message: "User registered successfully", user: { name, email, role } },
      { status: 200 }
    );

    // تعيين الكوكي من السيرفر مباشرة (تمنع الـ Role Spoofing تماماً)
    response.cookies.set("user-role", role, {
      path: "/",
      maxAge: 86400, // يوم كامل
      httpOnly: true, // تمنع الجافاسكريبت في الفرونت إند من تعديلها أو قراءتها
      secure: process.env.NODE_ENV === "production",
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}