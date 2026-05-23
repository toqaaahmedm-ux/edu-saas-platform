import { NextResponse } from "next/server";
import { QUIZ_QUESTIONS } from "@/data/quizzes.data";
import { QUIZ_ANSWERS } from "../_answers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentAnswers } = body; // بنستلم إجابات الطالب بس

    if (!studentAnswers) {
      return NextResponse.json({ error: "Missing answers" }, { status: 400 });
    }

    let correctCount = 0;

    // الحسبة بتتم هنا جوه السيرفر.. مستحيل المتصفح يشوفها!
    Object.keys(studentAnswers).forEach((qId) => {
      if (studentAnswers[qId] === QUIZ_ANSWERS[qId as keyof typeof QUIZ_ANSWERS]) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);

    return NextResponse.json({ finalScore }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}