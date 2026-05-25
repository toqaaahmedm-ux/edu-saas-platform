import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();


async function main() {
  console.log('🌱 Seeding database...');

  // الترتيب مهم — نحذف الـ relations الأول
  await prisma.certificate.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.session.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();


  // إضافة الـ Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.createMany({
    data: [
      {
        name: 'Admin User',
        email: 'admin@edusaas.com',
        hashedPassword,
        role: 'ADMIN',
      },
      {
        name: 'Test Teacher',
        email: 'teacher@edusaas.com',
        hashedPassword,
        role: 'TEACHER',
      },
      {
        name: 'Demo Student',
        email: 'student@edusaas.com',
        hashedPassword,
        role: 'STUDENT',
      },
    ],
  });

  // إضافة الكورسات
  await prisma.course.createMany({
    data: [
      {
        title: "Introduction to Human Anatomy",
        description: "نظرة شاملة على هيكل جسم الإنسان والأنظمة الحيوية الأساسية.",
        instructor: "Test Teacher",
        thumbnail: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800",
        category: "Anatomy",
        price: 300,
        lessonsCount: 10,
        videoUrl: "https://www.youtube.com/watch?v=uBGl2BujkPQ",
      },
      {
        title: "Skeletal System Masterclass",
        description: "دراسة تفصيلية لجميع عظام الجسم والمفاصل والرباطات.",
        instructor: "Dr. Ahmed Ali",
        thumbnail: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800",
        category: "Anatomy",
        price: 450,
        lessonsCount: 15,
        videoUrl: "https://www.youtube.com/watch?v=_9mQXBGDnFo",
      },
      {
        title: "Muscular System & Biomechanics",
        description: "كيف تعمل العضلات؟ دراسة منشأ العضلات واندغامها وحركتها.",
        instructor: "Dr. Sarah Ahmed",
        thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
        category: "Anatomy",
        price: 400,
        lessonsCount: 12,
        videoUrl: "https://www.youtube.com/watch?v=VmCiPIqSSiM",
      },
      {
        title: "Cardiovascular Anatomy",
        description: "تشريح القلب والأوعية الدموية والدورة الدموية الكبرى والصغرى.",
        instructor: "Dr. Khaled Youssef",
        thumbnail: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=800",
        category: "Anatomy",
        price: 500,
        lessonsCount: 8,
        videoUrl: "https://www.youtube.com/watch?v=CWFyxn0qDEU",
      },
      {
        title: "Neuroanatomy Essentials",
        description: "دراسة تشريح الجهاز العصبي المركزي والطرفي والدماغ.",
        instructor: "Dr. Toqaa Ahmed",
        thumbnail: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
        category: "Anatomy",
        price: 600,
        lessonsCount: 20,
        videoUrl: "https://www.youtube.com/watch?v=RGqgfAMfPaM",
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });