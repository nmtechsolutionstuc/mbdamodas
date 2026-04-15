-- AlterTable
ALTER TABLE "items" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "featuredSectionTitle" TEXT DEFAULT 'Destacados';
