// ✅ FE-M05: إضافة SUPER_ADMIN لـ Role type عشان يتطابق مع الباك إند والـ useAuthStore
export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'SUPER_ADMIN';

// عقد بيانات اليوزر.. عشان كل المشروع يمشي على شكل واحد (Fix TC-04)
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  tenantId?: string; // ✅ مفيد للـ multi-tenant checks في الفرونت إند
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
  status?: string;
  enrollmentCount?: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  videoUrl: string;
  duration: string;
}

// تعريف السؤال.. شيلت منه الإجابة الصحيحة عشان متبقاش مكشوفة عند الطالب (Security Fix)
// CRIT-08 FIX: الحقل كان اسمه question، لكن الباك إند فعلياً بيرجّع text —
// الـ template في صفحة الكويز بيستخدم currentQ.text، فكان الـ type هنا غلط
// ومش بيمسك الخطأ ده وقت الـ compile. عدّلناه ليتطابق مع شكل البيانات
// الحقيقي القادم من الباك إند.
export interface Question {
  id: string;
  text: string;
  options: string[];
}

// ضيفت الـ Quiz عشان يبقى له شكل واضح في الـ Store
export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  timeLimit: number; // بالثواني
  courseId?: string; // ✅ مفيد لصفحة النتيجة عشان تعرف تبعت الـ courseId
}