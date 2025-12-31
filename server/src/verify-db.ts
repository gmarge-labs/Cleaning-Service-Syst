import 'dotenv/config';
import prisma from './utils/prisma';

async function main() {
  try {
    console.log('Connecting to database...');
    const userCount = await prisma.user.count();
    console.log(`Successfully connected! Current user count: ${userCount}`);

    const users = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    console.log('Sample users:', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
