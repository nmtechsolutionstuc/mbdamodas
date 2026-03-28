-- AlterTable
ALTER TABLE "users" ADD COLUMN "dni" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_dni_key" ON "users"("dni");
