import { PrismaClient, Role } from '../src/generated/prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const users = [
    {
      id: 'seed_admin',
      email: 'admin@admin.com',
      name: 'Admin User',
      role: Role.ADMIN,
      password,
    },
    {
      id: 'seed_supervisor',
      email: 'supervisor@supervisor.com',
      name: 'Supervisor User',
      role: Role.SUPERVISOR,
      password,
    },
    {
      id: 'seed_support',
      email: 'support@support.com',
      name: 'Support User',
      role: Role.SUPPORT,
      password,
    },
    {
      id: 'seed_cleaner',
      email: 'cleaner@sparkleville.com',
      name: 'Cleaner User',
      role: Role.CLEANER,
      password,
    },
    {
      id: 'seed_customer',
      email: 'customer@example.com',
      name: 'Customer User',
      role: Role.CUSTOMER,
      password,
    },
  ];

  console.log('Start seeding ...');

  for (const user of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      const createdUser = await prisma.user.create({
        data: user,
      });
      console.log(`Created user with id: ${createdUser.id}`);
    } else {
      console.log(`User with email ${user.email} already exists`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
