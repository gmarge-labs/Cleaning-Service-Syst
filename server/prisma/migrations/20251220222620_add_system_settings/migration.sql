-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "general" JSONB NOT NULL,
    "pricing" JSONB NOT NULL,
    "servicePrices" JSONB NOT NULL,
    "roomPrices" JSONB NOT NULL,
    "addonPrices" JSONB NOT NULL,
    "integrations" JSONB NOT NULL,
    "notifications" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);
