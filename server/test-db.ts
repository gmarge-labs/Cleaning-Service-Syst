import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing connection...');
    try {
        const userCount = await prisma.user.count();
        console.log(`Connection successful. User count: ${userCount}`);
        const users = await prisma.user.findMany({ take: 5 });
        console.log('Sample users:', JSON.stringify(users, null, 2));
    } catch (error: any) {
        console.error('Connection failed:');
        console.error(error.message);
        if (error.code) console.error(`Code: ${error.code}`);
    } finally {
        await prisma.$disconnect();
    }
}

main();
