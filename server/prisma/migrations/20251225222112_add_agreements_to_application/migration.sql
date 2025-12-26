/*
  Warnings:

  - You are about to drop the column `unit` on the `InventoryItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CleanerApplication" ADD COLUMN     "agreedToBackgroundCheck" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "agreedToTerms" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "InventoryItem" DROP COLUMN "unit",
ADD COLUMN     "baseUnit" TEXT,
ADD COLUMN     "itemsPerPurchaseUnit" INTEGER,
ADD COLUMN     "pricePerPurchaseUnit" DECIMAL(10,2),
ADD COLUMN     "purchaseUnit" TEXT,
ADD COLUMN     "quantityPurchased" INTEGER;
