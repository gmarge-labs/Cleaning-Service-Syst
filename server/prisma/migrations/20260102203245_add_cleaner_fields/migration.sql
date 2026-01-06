-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BookingStatus" ADD VALUE 'ARRIVED';
ALTER TYPE "BookingStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "BookingStatus" ADD VALUE 'REVISION_REQUESTED';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "cleanerId" TEXT,
ADD COLUMN     "cleanerProvidedCode" TEXT,
ADD COLUMN     "completionIssues" TEXT,
ADD COLUMN     "completionNotes" TEXT,
ADD COLUMN     "completionPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "isAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "revisionPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "revisionReason" TEXT,
ADD COLUMN     "securityCode" TEXT,
ADD COLUMN     "startTime" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankAccountName" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "pushToken" TEXT,
ADD COLUMN     "routingNumber" TEXT;

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CleanerAssignments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CleanerAssignments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");

-- CreateIndex
CREATE INDEX "_CleanerAssignments_B_index" ON "_CleanerAssignments"("B");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_cleanerId_fkey" FOREIGN KEY ("cleanerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CleanerAssignments" ADD CONSTRAINT "_CleanerAssignments_A_fkey" FOREIGN KEY ("A") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CleanerAssignments" ADD CONSTRAINT "_CleanerAssignments_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
