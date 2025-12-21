/*
  Warnings:

  - Added the required column `cleanerPay` to the `SystemSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SystemSettings" ADD COLUMN     "cleanerPay" JSONB NOT NULL DEFAULT '{"level1": 18, "level2": 22}'::jsonb;
