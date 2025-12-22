import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking prisma.review...');
    if ('review' in prisma) {
      console.log('prisma.review exists!');
    } else {
      console.log('prisma.review DOES NOT exist on prisma client.');
      console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
