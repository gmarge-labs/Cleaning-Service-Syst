import 'dotenv/config';
import { PrismaClient, Role } from './src/generated/prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`Creating/Updating admin user: ${email}`);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: Role.ADMIN,
    },
    create: {
      id: 'manual_admin_01',
      email,
      name: 'Manual Admin',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log(`Success! User ${user.email} is ready.`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
