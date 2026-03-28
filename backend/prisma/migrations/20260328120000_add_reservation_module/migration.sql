-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- AlterTable Store
ALTER TABLE "stores" ADD COLUMN "storeAttendantPhone" TEXT;

-- AlterTable Item
ALTER TABLE "items" ADD COLUMN "isOwnProduct" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "promoterCommissionPct" DECIMAL(5,2);

-- CreateTable
CREATE TABLE "reservations" (
  "id" TEXT NOT NULL,
  "reservationCode" TEXT NOT NULL,
  "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
  "adminNote" TEXT,
  "extensionCount" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "itemId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "storeId" TEXT NOT NULL,
  CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reservations_reservationCode_key" ON "reservations"("reservationCode");
CREATE INDEX "reservations_itemId_idx" ON "reservations"("itemId");
CREATE INDEX "reservations_userId_idx" ON "reservations"("userId");
CREATE INDEX "reservations_status_idx" ON "reservations"("status");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
