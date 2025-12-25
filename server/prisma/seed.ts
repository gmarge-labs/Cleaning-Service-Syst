import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // const password = await bcrypt.hash('password123', 10);
  const password = '$2b$10$YourHardcodedHashHereForSeeding'; // Sample hash for 'password123'

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
      email: 'cleaner@Sparkleville.com',
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

  // Seed Inventory
  const inventoryItems = [
    {
      name: 'All-Purpose Cleaner',
      category: 'Cleaning Supplies',
      quantity: 45,
      unit: 'bottles',
      reorderThreshold: 20,
      vendor: 'CleanCo Supplies',
      cost: 12.99,
    },
    {
      name: 'Microfiber Cloths',
      category: 'Equipment',
      quantity: 12,
      unit: 'packs',
      reorderThreshold: 15,
      vendor: 'ProClean Equipment',
      cost: 24.99,
    },
    {
      name: 'Disinfectant Spray',
      category: 'Cleaning Supplies',
      quantity: 8,
      unit: 'bottles',
      reorderThreshold: 10,
      vendor: 'CleanCo Supplies',
      cost: 15.99,
    }
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where: { id: `seed_${item.name.replace(/\s+/g, '_').toLowerCase()}` },
      update: {},
      create: {
        id: `seed_${item.name.replace(/\s+/g, '_').toLowerCase()}`,
        ...item
      }
    });
  }

  for (const user of users) {
    console.log(`Seeding user: ${user.email}`);
    try {
      const result = await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          role: user.role,
          password: user.password,
        },
        create: user,
      });
      console.log(`Successfully seeded user: ${result.email} (ID: ${result.id})`);
    } catch (error: any) {
      console.error(`Error seeding user ${user.email}:`);
      console.log(`MESSAGE: ${error.message}`);
      if (error.code) console.log(`CODE: ${error.code}`);
      throw error;
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Seeding error details:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
