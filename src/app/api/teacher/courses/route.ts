import { NextResponse } from 'next/server';

export async function GET() {
  const courses = [
    { id: 1, title: "Advanced Medical Anatomy", enrollmentCount: 450, status: "Live" },
    { id: 2, title: "Clinical Biochemistry", enrollmentCount: 320, status: "Live" },
    { id: 3, title: "Pharmacology Basics", enrollmentCount: 280, status: "Draft" },
  ];
  return NextResponse.json({ data: courses });
}