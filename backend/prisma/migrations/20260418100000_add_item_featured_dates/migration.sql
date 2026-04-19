-- AlterTable: add featuredAt and featuredUntil to items
ALTER TABLE "items" ADD COLUMN "featuredAt" TIMESTAMP(3);
ALTER TABLE "items" ADD COLUMN "featuredUntil" TIMESTAMP(3);
