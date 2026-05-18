import { NextResponse } from "next/server";
// [تقرير 1 - صفحة 4]: استيراد الأسئلة والإجابات النموذجية هنا في بيئة السيرفر فقط (Fix NEW-04)
// هذا يضمن عدم شحن الإجابات الصحيحة إلى حزمة العميل (Client Bundle) نهائياً
import { QUIZ_QUESTIONS, QUIZ_ANSWERS } from "@/data/quizzes.data";

export async function POST(request: Request) {
  try {
    // 1. استقبال الإجابات المرسلة من الفرونت إند
    const body = await request.json();
    const studentAnswers = body.answers as Record<string, string>;

    if (!studentAnswers) {
      return NextResponse.json(
        { error: "Missing student answers payload" },
        { status: 400 }
      );
    }

    let correctCount = 0;

    // 2. مقارنة إجابات الطالب بالثابت الآمن المحفوظ في السيرفر
    Object.keys(studentAnswers).forEach((qId) => {
      const studentAnswer = studentAnswers[qId];
      const correctAnswer = QUIZ_ANSWERS[qId as keyof typeof QUIZ_ANSWERS];

      if (studentAnswer === correctAnswer) {
        correctCount++;
      }
    });

    // 3. حساب النسبة المئوية التقريبية الصحيحة بناءً على إجمالي عدد الأسئلة الحقيقي
    const totalQuestions = QUIZ_QUESTIONS.length;
    const finalScore = totalQuestions > 0 
      ? Math.round((correctCount / totalQuestions) * 100) 
      : 0;

    // 4. إرجاع النسبة الرقمية فقط للعميل لحمايتها من التلاعب عبر الـ DevTools
    return NextResponse.json({ score: finalScore }, { status: 200 });

  } catch (error) {
    console.error("Quiz submission server error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during score calculation" },
      { status: 500 }
    );
  }
}