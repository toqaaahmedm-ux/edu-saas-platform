// FE-M05: added SUPER_ADMIN to the Role type to match the backend and useAuthStore
export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'SUPER_ADMIN';

// user data contract, so the whole project stays consistent (Fix TC-04)
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  tenantId?: string; 
}

// fixed the price field here, kept it as Number always for calculations (Fix Audit Note)
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

// question definition — removed the correct answer from it so it's not exposed to the student (Security Fix)
// CRIT-08 FIX: the field used to be called question, but the backend actually returns text —
// the template on the quiz page uses currentQ.text, so the type here was wrong
// and wasn't catching the error at compile time. Updated it to match the real
// shape of the data coming from the backend.
export interface Question {
  id: string;
  text: string;
  options: string[];
}

// added Quiz so it has a clear shape in the store
export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  // in seconds
  // useful for the results page so it knows to send the courseId
}
// ADD these to your existing @/types file (next to the Course interface).
// They mirror the Prisma models exactly, so the shape matches what the
// backend actually returns — no guessing on field names.

export interface Module {
  id: string;
  tenantId: string;
  courseId: string;
  title: string;
  description?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  tenantId: string;
  courseId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  maxScore: number;
  isPublished: boolean;
  allowFileUpload: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubmissionStatus = "DRAFT" | "SUBMITTED" | "GRADED" | "RETURNED";

export interface AssignmentSubmission {
  id: string;
  tenantId: string;
  assignmentId: string;
  studentId: string;
  fileUrl?: string | null;
  textContent?: string | null;
  status: SubmissionStatus;
  score?: number | null;
  feedback?: string | null;
  submittedAt?: string | null;
  gradedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}