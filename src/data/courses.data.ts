import { Course } from '@/types';

export const COURSES: Course[] = [
  {
    id: "anatomy-1",
    title: "Introduction to Human Anatomy",
    description: "نظرة شاملة على هيكل جسم الإنسان والأنظمة الحيوية الأساسية.",
    // صورة تشريح عامة احترافية
    thumbnail: "https://unsplash.com",
    instructor: "Dr. Mo.Hafez",
    category: "Anatomy",
    price: 300,
    lessonsCount: 10,
    videoUrl: "https://w3schools.com"
  },
  {
    id: "anatomy-2",
    title: "Skeletal System Masterclass",
    description: "دراسة تفصيلية لجميع عظام الجسم والمفاصل والرباطات.",
    // صورة هيكل عظمي
    thumbnail: "https://unsplash.com",
    instructor: "Dr. Ahmed Ali",
    category: "Anatomy",
    price: 450,
    lessonsCount: 15,
    videoUrl: "https://w3schools.com"
  },
  {
    id: "anatomy-3",
    title: "Muscular System & Biomechanics",
    description: "كيف تعمل العضلات؟ دراسة منشأ العضلات واندغامها وحركتها.",
    // صورة للعضلات أو اللياقة الطبية
    thumbnail: "https://unsplash.com",
    instructor: "Dr. Sarah Ahmed",
    category: "Anatomy",
    price: 400,
    lessonsCount: 12,
    videoUrl: "https://w3schools.com"
  },
  {
    id: "anatomy-4",
    title: "Cardiovascular Anatomy",
    description: "تشريح القلب والأوعية الدموية والدورة الدموية الكبرى والصغرى.",
    // صورة طبية للقلب
    thumbnail: "https://unsplash.com",
    instructor: "Dr. Khaled Youssef",
    category: "Anatomy",
    price: 500,
    lessonsCount: 8,
    videoUrl: "https://w3schools.com"
  },
  {
    id: "anatomy-5",
    title: "Neuroanatomy Essentials",
    description: "دراسة تشريح الجهاز العصبي المركزي والطرفي والدماغ.",
    //  ومش عايزة تفتح معاي الصور يا محمد 
    // صورة للدماغ والأعصاب
    thumbnail: "https://unsplash.com",
    instructor: "Dr. Toqaa Ahmed",
    category: "Anatomy",
    price: 600,
    lessonsCount: 20,
    videoUrl: "https://www.w3schools.com"
  }
];
