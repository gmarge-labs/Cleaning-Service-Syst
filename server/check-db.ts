import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTable() {
  try {
    const count = await prisma.inventoryItem.count();
    console.log(`✅ InventoryItem table exists and has ${count} records.`);
  } catch (error) {
    console.error('❌ InventoryItem table does not seem to exist or there is an error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTable();
