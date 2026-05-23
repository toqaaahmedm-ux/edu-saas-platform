import { NextResponse } from 'next/server';

export async function GET() {
  // دي الداتا اللي الـ Charts هتحتاجها (Mock Data for now)
  const analyticsData = {
    performanceTrend: [
      { month: 'Jan', score: 65 },
      { month: 'Feb', score: 72 },
      { month: 'Mar', score: 80 },
      { month: 'Apr', score: 85 },
      { month: 'May', score: 92 },
    ],
    quizDistribution: [
      { name: 'Excellent', value: 40 },
      { name: 'Good', value: 35 },
      { name: 'Needs Improvement', value: 25 },
    ]
  };

  return NextResponse.json({ data: analyticsData });
}