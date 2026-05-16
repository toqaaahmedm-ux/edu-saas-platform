// [تقرير 1 - صفحة 2]: صلحت الـ Git Secrets (NEW-10) 
// شيلت الإيميلات والباسوردات الحقيقية عشان متبقاش مكشوفة على GitHub

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'; // الأدوار متحدة هنا بالملي (Fix TC-04)
}

export const USERS_DATA: User[] = [
  {
    id: "u1",
    name: "Admin User",
    email: "admin@edusaas.com",
    password: "password123", // مفيش باسوردات حقيقية هنا تاني
    role: "ADMIN"
  },
  {
    id: "u2",
    name: "Test Teacher",
    email: "teacher@edusaas.com",
    password: "password123",
    role: "TEACHER"
  },
  {
    id: "u3",
    name: "Demo Student",
    email: "student@edusaas.com",
    password: "password123",

    
    role: "STUDENT"
  }
];
