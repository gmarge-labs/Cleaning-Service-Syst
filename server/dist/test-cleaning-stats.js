"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("./utils/prisma"));
const client_1 = require("@prisma/client");
function testCleaningStats() {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = `TEST-${Date.now()}`;
        console.log(`Setting up test for user: ${userId}`);
        try {
            // Create test user
            yield prisma_1.default.user.create({
                data: {
                    id: userId,
                    email: `test-${Date.now()}@example.com`,
                    password: 'password123',
                    name: 'Test Customer',
                    role: client_1.Role.CUSTOMER
                }
            });
            console.log('User created. Creating 6 completed bookings...');
            // Create 6 completed bookings
            for (let h = 0; h < 6; h++) {
                yield prisma_1.default.booking.create({
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
            const completedCount = yield prisma_1.default.booking.count({
                where: { userId, status: 'COMPLETED' }
            });
            const usedRewards = yield prisma_1.default.booking.count({
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
            }
            else {
                console.log('\n❌ Stats test FAILED');
            }
            console.log('\nCreating a booking with free-cleaning-reward...');
            yield prisma_1.default.booking.create({
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
            const usedRewardsAfter = yield prisma_1.default.booking.count({
                where: { userId, paymentMethod: 'free-cleaning-reward' }
            });
            const availableRewardsAfter = Math.max(0, earnedRewards - usedRewardsAfter);
            console.log(`- Available Rewards After: ${availableRewardsAfter}`);
            if (availableRewardsAfter === 0) {
                console.log('✅ Reward usage test PASSED');
            }
            else {
                console.log('❌ Reward usage test FAILED');
            }
        }
        catch (error) {
            console.error('Test error:', error);
        }
        finally {
            // Cleanup
            console.log('\nCleaning up test data...');
            yield prisma_1.default.booking.deleteMany({ where: { userId } });
            yield prisma_1.default.user.delete({ where: { id: userId } });
            yield prisma_1.default.$disconnect();
            console.log('Done.');
        }
    });
}
testCleaningStats();
