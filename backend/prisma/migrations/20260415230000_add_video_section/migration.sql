-- AlterTable: add videoSection JSON column to Store
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "videoSection" JSONB;
