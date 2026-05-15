// [تقرير 1 - صفحة 3]: هنا "المصدر الوحيد للحقيقة" عشان ميبقاش فيه تضارب (Single Source of Truth)
// جمعت كل الـ Types في مكان واحد ومش هيتكررو في كذا ملف (Fix Architecture)

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

// عقد بيانات اليوزر.. عشان كل المشروع يمشي على شكل واحد (Fix TC-04)
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

// هنا صلحنا بند السعر (Price) وخليته Number دايماً عشان الحسابات (Fix Audit Note)
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  category: string;
  price: number; 
  lessonsCount: number;
  videoUrl?: string;
  enrolledStudents?: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  videoUrl: string;
  duration: string;
}

// تعريف السؤال.. شيلت منه الإجابة الصحيحة عشان متبقاش مكشوفة عند الطالب (Security Fix)
export interface Question {
  id: string;
  question: string;
  options: string[];
}

// ضيفت الـ Quiz عشان يبقى له شكل واضح في الـ Store
export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  timeLimit: number; // بالثواني
}
