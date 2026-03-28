/*
  Warnings:

  - You are about to drop the column `category` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `submission_items` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `submission_items` table. All the data in the column will be lost.
  - Added the required column `productTypeId` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productTypeId` to the `submission_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "items_category_idx";

-- AlterTable
ALTER TABLE "items" DROP COLUMN "category",
DROP COLUMN "size",
ADD COLUMN     "productTypeId" TEXT NOT NULL,
ADD COLUMN     "sizeId" TEXT;

-- AlterTable
ALTER TABLE "submission_items" DROP COLUMN "category",
DROP COLUMN "size",
ADD COLUMN     "productTypeId" TEXT NOT NULL,
ADD COLUMN     "sizeId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bankAlias" TEXT,
ADD COLUMN     "paymentMethod" TEXT;

-- DropEnum
DROP TYPE "ItemCategory";

-- DropEnum
DROP TYPE "ItemSize";

-- CreateTable
CREATE TABLE "product_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "requiresSize" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sizes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productTypeId" TEXT NOT NULL,

    CONSTRAINT "sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productTypeId" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_tags" (
    "itemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "item_tags_pkey" PRIMARY KEY ("itemId","tagId")
);

-- CreateTable
CREATE TABLE "submission_item_tags" (
    "submissionItemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "submission_item_tags_pkey" PRIMARY KEY ("submissionItemId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_types_name_key" ON "product_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_types_code_key" ON "product_types"("code");

-- CreateIndex
CREATE INDEX "sizes_productTypeId_idx" ON "sizes"("productTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "sizes_productTypeId_name_key" ON "sizes"("productTypeId", "name");

-- CreateIndex
CREATE INDEX "tags_productTypeId_idx" ON "tags"("productTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_productTypeId_name_key" ON "tags"("productTypeId", "name");

-- CreateIndex
CREATE INDEX "items_productTypeId_idx" ON "items"("productTypeId");

-- CreateIndex
CREATE INDEX "submission_items_productTypeId_idx" ON "submission_items"("productTypeId");

-- AddForeignKey
ALTER TABLE "sizes" ADD CONSTRAINT "sizes_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "product_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "product_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_tags" ADD CONSTRAINT "item_tags_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_tags" ADD CONSTRAINT "item_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_item_tags" ADD CONSTRAINT "submission_item_tags_submissionItemId_fkey" FOREIGN KEY ("submissionItemId") REFERENCES "submission_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_item_tags" ADD CONSTRAINT "submission_item_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_items" ADD CONSTRAINT "submission_items_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "product_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_items" ADD CONSTRAINT "submission_items_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "product_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
