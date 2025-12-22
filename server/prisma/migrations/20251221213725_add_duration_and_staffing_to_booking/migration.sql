-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "cleanerCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "estimatedDuration" INTEGER;

-- AlterTable
ALTER TABLE "SystemSettings" ADD COLUMN     "durationSettings" JSONB;
