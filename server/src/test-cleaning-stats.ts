import prisma from './utils/prisma';
import { generateUserId } from './utils/idGenerator';
import { Role } from '@prisma/client';

async function testCleaningStats() {
    const userId = `TEST-${Date.now()}`;
    console.log(`Setting up test for user: ${userId}`);

    try {
        // Create test user
        await prisma.user.create({
            data: {
                id: userId,
                email: `test-${Date.now()}@example.com`,
                password: 'password123',
                name: 'Test Customer',
                role: Role.CUSTOMER
            }
        });

        console.log('User created. Creating 6 completed bookings...');

        // Create 6 completed bookings
        for (let h = 0; h < 6; h++) {
            await prisma.booking.create({
                data: {
                    id: `BK-TEST-${userId}-${h}`,
                    userId: userId,
                    serviceType: 'Standard Cleaning',
                    totalAmount: 100,
                    date: new Date(),
                    time: '10:00 AM',
                    propertyType: 'Apartment',
                    status: 'COMPLETED',
                    cleanerCount: 1,
                    frequency: 'One-time'
                }
            });
        }

        console.log('Bookings created. Checking stats...');

        // Simulate getCleaningStats logic
        const completedCount = await prisma.booking.count({
            where: { userId, status: 'COMPLETED' }
        });

        const usedRewards = await prisma.booking.count({
            where: { userId, paymentMethod: 'free-cleaning-reward' }
        });

        const threshold = 5;
        const earnedRewards = Math.floor(completedCount / threshold);
        const availableRewards = Math.max(0, earnedRewards - usedRewards);
        const progressToNext = completedCount % threshold;

        console.log('Expected Stats:');
        console.log(`- Completed: 6`);
        console.log(`- Available Rewards: 1 (floor(6/5) - 0)`);
        console.log(`- Progress to Next: 1 (6 % 5)`);

        console.log('\nActual Stats:');
        console.log(`- Completed: ${completedCount}`);
        console.log(`- Available Rewards: ${availableRewards}`);
        console.log(`- Progress to Next: ${progressToNext}`);

        if (completedCount === 6 && availableRewards === 1 && progressToNext === 1) {
            console.log('\n✅ Stats test PASSED');
        } else {
            console.log('\n❌ Stats test FAILED');
        }

        console.log('\nCreating a booking with free-cleaning-reward...');
        await prisma.booking.create({
            data: {
                id: `BK-TEST-${userId}-FREE`,
                userId: userId,
                serviceType: 'Standard Cleaning',
                totalAmount: 0,
                date: new Date(),
                time: '11:00 AM',
                propertyType: 'Apartment',
                status: 'PENDING',
                cleanerCount: 1,
                frequency: 'One-time',
                paymentMethod: 'free-cleaning-reward'
            }
        });

        const usedRewardsAfter = await prisma.booking.count({
            where: { userId, paymentMethod: 'free-cleaning-reward' }
        });

        const availableRewardsAfter = Math.max(0, earnedRewards - usedRewardsAfter);
        console.log(`- Available Rewards After: ${availableRewardsAfter}`);

        if (availableRewardsAfter === 0) {
            console.log('✅ Reward usage test PASSED');
        } else {
            console.log('❌ Reward usage test FAILED');
        }

    } catch (error) {
        console.error('Test error:', error);
    } finally {
        // Cleanup
        console.log('\nCleaning up test data...');
        await prisma.booking.deleteMany({ where: { userId } });
        await prisma.user.delete({ where: { id: userId } });
        await prisma.$disconnect();
        console.log('Done.');
    }
}

testCleaningStats();
