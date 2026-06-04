import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.certificate.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.session.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  const teacher = await prisma.user.create({
    data: {
      name: 'Test Teacher',
      email: 'teacher@edusaas.com',
      hashedPassword,
      role: 'TEACHER',
    },
  });

  await prisma.user.createMany({
    data: [
      { name: 'Admin User', email: 'admin@edusaas.com', hashedPassword, role: 'ADMIN' },
      { name: 'Demo Student', email: 'student@edusaas.com', hashedPassword, role: 'STUDENT' },
    ],
  });

  await prisma.course.createMany({
    data: [
      { title: 'Introduction to Human Anatomy', description: 'نظرة شاملة على هيكل جسم الإنسان', price: 300, category: 'Anatomy', instructorId: teacher.id, status: 'PUBLISHED' },
      { title: 'Skeletal System Masterclass', description: 'دراسة تفصيلية لجميع عظام الجسم', price: 450, category: 'Anatomy', instructorId: teacher.id, status: 'PUBLISHED' },
    ],
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });