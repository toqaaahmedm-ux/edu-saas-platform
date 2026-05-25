import { NextResponse } from "next/server";
import { QUIZ_QUESTIONS } from "@/data/quizzes.data";
import { QUIZ_ANSWERS } from "../_answers";

const QUIZ_DURATION_SECONDS = 30 * 60; // 30 دقيقة

//  R4-SIG-02: الـ start time بيتحفظ server-side مش من الـ client
const quizSessions = new Map<string, number>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const studentAnswers = body.answers as Record<string, string>;
    console.log("Student Answers:", studentAnswers);
    console.log("Quiz Answers:", QUIZ_ANSWERS);
    const sessionId = body.sessionId as string;

    if (!studentAnswers) {
      return NextResponse.json(
        { error: "Missing student answers payload" },
        { status: 400 }
      );
    }

    // التحقق من الـ timer server-side
    if (sessionId) {
      const startedAt = quizSessions.get(sessionId);
      if (startedAt) {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        if (elapsed > QUIZ_DURATION_SECONDS + 30) {
          quizSessions.delete(sessionId);
          return NextResponse.json(
            { error: "Quiz time expired", score: 0 },
            { status: 200 }
          );
        }
        quizSessions.delete(sessionId);
      }
    }

    let correctCount = 0;

for (const qId of Object.keys(studentAnswers)) {
  const studentAnswer = String(studentAnswers[qId]);
  const correctAnswer = String(QUIZ_ANSWERS[qId as keyof typeof QUIZ_ANSWERS]);
  console.log(`Q: ${qId} | Student: ${studentAnswer} | Correct: ${correctAnswer} | Match: ${studentAnswer === correctAnswer}`);
  if (studentAnswer === correctAnswer) {
    correctCount++;
  }
}
    const totalQuestions = QUIZ_QUESTIONS.length;
    const score = totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;

    //  R4-SIG-06: بس key واحد في الـ response
    return NextResponse.json({ score }, { status: 200 });

  } catch (error) {
    console.error("Quiz submission server error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during score calculation" },
      { status: 500 }
    );
  }
}

//  endpoint جديد لبدء الكويز وتسجيل الـ start time server-side
export async function PUT(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    quizSessions.set(sessionId, Date.now());

    return NextResponse.json({ success: true, startedAt: Date.now() });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start quiz session" },
      { status: 500 }
    );
  }
}