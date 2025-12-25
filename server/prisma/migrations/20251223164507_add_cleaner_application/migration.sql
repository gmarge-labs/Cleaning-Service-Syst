-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "CleanerApplication" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "ssn" TEXT NOT NULL,
    "reference1Name" TEXT NOT NULL,
    "reference1Phone" TEXT NOT NULL,
    "reference1Relationship" TEXT NOT NULL,
    "reference1RelationshipOther" TEXT,
    "reference1Address" TEXT NOT NULL,
    "reference1City" TEXT NOT NULL,
    "reference1State" TEXT NOT NULL,
    "reference2Name" TEXT NOT NULL,
    "reference2Phone" TEXT NOT NULL,
    "reference2Relationship" TEXT NOT NULL,
    "reference2RelationshipOther" TEXT,
    "reference2Address" TEXT NOT NULL,
    "reference2City" TEXT NOT NULL,
    "reference2State" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CleanerApplication_pkey" PRIMARY KEY ("id")
);
