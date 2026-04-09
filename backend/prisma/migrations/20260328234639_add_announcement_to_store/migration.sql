-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "announcementActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "announcementText" TEXT;
