import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);
    await prisma.user.update({
        where: { email: 'admin@admin.com' },
        data: { password }
    });
    console.log('Admin password reset to password123');
}

main().finally(() => prisma.$disconnect());
