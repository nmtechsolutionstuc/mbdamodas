-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_submissionItemId_fkey";

-- AlterTable
ALTER TABLE "items" ALTER COLUMN "submissionItemId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_submissionItemId_fkey" FOREIGN KEY ("submissionItemId") REFERENCES "submission_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
