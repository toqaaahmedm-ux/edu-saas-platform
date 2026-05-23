import { Course } from '@/types';

export const COURSES: Course[] = [
  {
    id: "anatomy-1",
    title: "Introduction to Human Anatomy",
    description: "نظرة شاملة على هيكل جسم الإنسان والأنظمة الحيوية الأساسية.",
    thumbnail: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&auto=format&fit=crop",
    instructor: "Dr. Mo.Hafez",
    category: "Anatomy",
    price: 300,
    lessonsCount: 10,
  
    videoUrl: "https://www.youtube.com/watch?v=uBGl2BujkPQ"
  },
  {
    id: "anatomy-2",
    title: "Skeletal System Masterclass",
    description: "دراسة تفصيلية لجميع عظام الجسم والمفاصل والرباطات.",
    thumbnail: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&auto=format&fit=crop",
    instructor: "Dr. Ahmed Ali",
    category: "Anatomy",
    price: 450,
    lessonsCount: 15,
    videoUrl: "https://www.youtube.com/watch?v=_9mQXBGDnFo"
  },
  {
    id: "anatomy-3",
    title: "Muscular System & Biomechanics",
    description: "كيف تعمل العضلات؟ دراسة منشأ العضلات واندغامها وحركتها.",
    thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop",
    instructor: "Dr. Sarah Ahmed",
    category: "Anatomy",
    price: 400,
    lessonsCount: 12,
    videoUrl: "https://www.youtube.com/watch?v=VmCiPIqSSiM"
  },
  {
    id: "anatomy-4",
    title: "Cardiovascular Anatomy",
    description: "تشريح القلب والأوعية الدموية والدورة الدموية الكبرى والصغرى.",
    thumbnail: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=800&auto=format&fit=crop",
    instructor: "Dr. Khaled Youssef",
    category: "Anatomy",
    price: 500,
    lessonsCount: 8,
    videoUrl: "https://www.youtube.com/watch?v=CWFyxn0qDEU"
  },
  {
    id: "anatomy-5",
    title: "Neuroanatomy Essentials",
    description: "دراسة تشريح الجهاز العصبي المركزي والطرفي والدماغ.",
    thumbnail: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop",
    instructor: "Dr. Toqaa Ahmed",
    category: "Anatomy",
    price: 600,
    lessonsCount: 20,
    videoUrl: "https://www.youtube.com/watch?v=RGqgfAMfPaM"
  }
];