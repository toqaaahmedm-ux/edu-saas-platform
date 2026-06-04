export const STUDENT_STATS = {
  name: "Toqaa Ahmed", 
  enrolledCourses: 3, 
  certificatesEarned: 1,
  learningHours: 52,
};

export const COURSES = [
  {
    id: "1",
    title: "General Medical Anatomy",
    progress: 65,
    instructor: "Dr. Ahmed Kamal",
    image: "https://unsplash.com",
  },
  {
    id: "2",
    title: "Human Physiology",
    progress: 20,
    instructor: "Dr. Sarah Mahmoud",
    image: "https://unsplash.com",
  },
  {
    id: "3",
    title: "Clinical Internal Medicine",
    progress: 10,
    instructor: "Dr. Mohamed Ali",
    image: "https://unsplash.com",
  },
];


// حل BUG-04: التأكد من أن الإجابات مخفية ومنظمة
export const QUIZ_ANSWERS: Record<string, string> = {
  q1: "1", // Femur
  q2: "2", // 4 Valves
};

export const RECENT_QUIZZES = [
  {
    id: "rz1",
    title: "General Anatomy Quiz",
    status: "Passed",
    score: 85,
  }
];
