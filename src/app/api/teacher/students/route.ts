import { NextResponse } from 'next/server';

export async function GET() {
  const students = [
    { id: 1, name: "Tuqa Mohamed", email: "taqaa@mail.com", progress: 95, lastQuiz: 98, status: "Active" },
    { id: 2, name: "Mohamed Hafez", email: "hafez@mail.com", progress: 45, lastQuiz: 60, status: "Absent" },
    { id: 3, name: "Sara Mahmoud", email: "sara@mail.com", progress: 80, lastQuiz: 85, status: "Active" },
  ];
  return NextResponse.json({ data: students });
}