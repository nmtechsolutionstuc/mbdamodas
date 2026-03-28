-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubmissionItemStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'IN_STORE', 'SOLD', 'RETURNED');

-- CreateEnum
CREATE TYPE "ItemSize" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'UNICA');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('MUJER', 'HOMBRE', 'NINO', 'NINA', 'CALZADO', 'ACCESORIOS', 'OTRO');

-- CreateEnum
CREATE TYPE "ItemCondition" AS ENUM ('NUEVA_CON_ETIQUETA', 'NUEVA_SIN_ETIQUETA', 'COMO_NUEVA', 'BUEN_ESTADO', 'USO_MODERADO', 'USO_INTENSO');

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "defaultCommission" DECIMAL(5,2) NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "googleId" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "termsAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "storeId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sellerId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "condition" "ItemCondition" NOT NULL,
    "size" "ItemSize" NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "desiredPrice" DECIMAL(10,2) NOT NULL,
    "minimumPrice" DECIMAL(10,2),
    "status" "SubmissionItemStatus" NOT NULL DEFAULT 'PENDING',
    "adminComment" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submissionId" TEXT NOT NULL,

    CONSTRAINT "submission_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_item_photos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submissionItemId" TEXT NOT NULL,

    CONSTRAINT "submission_item_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "condition" "ItemCondition" NOT NULL,
    "size" "ItemSize" NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "minimumPrice" DECIMAL(10,2),
    "commission" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "soldAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submissionItemId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_photos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "item_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "submissions_sellerId_idx" ON "submissions"("sellerId");

-- CreateIndex
CREATE INDEX "submissions_storeId_idx" ON "submissions"("storeId");

-- CreateIndex
CREATE INDEX "submission_items_submissionId_idx" ON "submission_items"("submissionId");

-- CreateIndex
CREATE INDEX "submission_items_status_idx" ON "submission_items"("status");

-- CreateIndex
CREATE INDEX "submission_item_photos_submissionItemId_idx" ON "submission_item_photos"("submissionItemId");

-- CreateIndex
CREATE UNIQUE INDEX "items_submissionItemId_key" ON "items"("submissionItemId");

-- CreateIndex
CREATE INDEX "items_storeId_idx" ON "items"("storeId");

-- CreateIndex
CREATE INDEX "items_category_idx" ON "items"("category");

-- CreateIndex
CREATE INDEX "items_isActive_idx" ON "items"("isActive");

-- CreateIndex
CREATE INDEX "item_photos_itemId_idx" ON "item_photos"("itemId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_items" ADD CONSTRAINT "submission_items_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_item_photos" ADD CONSTRAINT "submission_item_photos_submissionItemId_fkey" FOREIGN KEY ("submissionItemId") REFERENCES "submission_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_submissionItemId_fkey" FOREIGN KEY ("submissionItemId") REFERENCES "submission_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_photos" ADD CONSTRAINT "item_photos_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
