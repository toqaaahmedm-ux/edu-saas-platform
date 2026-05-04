// src/data/users.data.ts

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';//تحديد الأدوار بدقة  (TC-04)
}

export const USERS_DATA: User[] = [
  {
    id: "u1",
    name: "Mohamed Hafez",
    email: "admin@edusaas.com",
    password: "password123",
    role: "ADMIN"
  },
  {
    id: "u2",
    name: "Dr. Ahmed Ali",
    email: "teacher@edusaas.com",
    password: "password123",
    role: "TEACHER"
  },
  {
    id: "u3",
    name: "Toqaa Ahmed",
    email: "toqaahmed96@gmail.com", // إيميلي الشخصي
    password: "123456", // الباسورد اللي كنتِ بتجرب بيه
    role: "STUDENT"
  },
  {
    id: "u4",
    name: "Demo Student",
    email: "student@edusaas.com",
    password: "password123",
    role: "STUDENT"
  }
];
