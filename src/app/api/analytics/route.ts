import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const { user, error } = await requireAuth(['TEACHER', 'ADMIN']);
  if (error) return error;

  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: user!.id } as any,
      select: { id: true },
    });
    const courseIds = courses.map((c) => c.id);

    // ARCH-01: الـ Frontend schema عنده completedAt مش submittedAt
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quiz: { courseId: { in: courseIds } },
        completedAt: { not: null },
      } as any,
      select: { score: true, completedAt: true } as any,
      orderBy: { completedAt: 'asc' } as any,
    });

    const excellent = attempts.filter((a: any) => a.score >= 85).length;
    const good = attempts.filter((a: any) => a.score >= 60 && a.score < 85).length;
    const needsWork = attempts.filter((a: any) => a.score < 60).length;

    const monthlyMap: Record<string, { total: number; count: number }> = {};
    attempts.forEach((a: any) => {
      if (!a.completedAt) return;
      const month = new Date(a.completedAt).toLocaleString('en', { month: 'short' });
      if (!monthlyMap[month]) monthlyMap[month] = { total: 0, count: 0 };
      monthlyMap[month].total += a.score;
      monthlyMap[month].count += 1;
    });

    const performanceTrend = Object.entries(monthlyMap).map(([month, { total, count }]) => ({
      month,
      score: Math.round(total / count),
    }));

    return NextResponse.json({
      data: {
        performanceTrend: performanceTrend.length > 0 ? performanceTrend : [
          { month: 'No data', score: 0 },
        ],
        quizDistribution: [
          { name: 'Excellent', value: excellent },
          { name: 'Good', value: good },
          { name: 'Needs Improvement', value: needsWork },
        ],
      },
    });
  } catch (err) {
    console.error('[GET /api/analytics]', err);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}