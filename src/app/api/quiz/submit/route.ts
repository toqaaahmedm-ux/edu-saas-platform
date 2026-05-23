import { NextResponse } from "next/server";
import { QUIZ_QUESTIONS } from "@/data/quizzes.data";
import { QUIZ_ANSWERS } from "../_answers";

const QUIZ_DURATION_SECONDS = 30 * 60; // 30 دقيقة

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const studentAnswers = body.answers as Record<string, string>;
    const startedAt = body.startedAt as number; // timestamp من الفرونت

    if (!studentAnswers) {
      return NextResponse.json(
        { error: "Missing student answers payload" },
        { status: 400 }
      );
    }

    // Server-side timer validation
    if (startedAt) {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      if (elapsed > QUIZ_DURATION_SECONDS + 30) { // 30 ثانية grace period
        return NextResponse.json(
          { error: "Quiz time expired", finalScore: 0 },
          { status: 200 }
        );
      }
    }

    let correctCount = 0;

    Object.keys(studentAnswers).forEach((qId) => {
      const studentAnswer = studentAnswers[qId];
      const correctAnswer = QUIZ_ANSWERS[qId as keyof typeof QUIZ_ANSWERS];
      if (studentAnswer === correctAnswer) {
        correctCount++;
      }
    });

    const totalQuestions = QUIZ_QUESTIONS.length;
    const finalScore = totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;

    return NextResponse.json({ score: finalScore, finalScore }, { status: 200 });

  } catch (error) {
    console.error("Quiz submission server error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during score calculation" },
      { status: 500 }
    );
  }
}