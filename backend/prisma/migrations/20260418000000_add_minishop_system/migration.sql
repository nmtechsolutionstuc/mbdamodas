-- CreateEnum
CREATE TYPE "MiniShopStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DELETED');
CREATE TYPE "MiniShopProductStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAUSED');

-- CreateTable
CREATE TABLE IF NOT EXISTS "mini_shops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "profilePhotoUrl" TEXT,
    "whatsapp" TEXT NOT NULL,
    "socialLinks" JSONB,
    "deliveryMethods" JSONB NOT NULL,
    "acceptedTerms" BOOLEAN NOT NULL DEFAULT false,
    "status" "MiniShopStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "mini_shops_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "mini_shop_products" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "MiniShopProductStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredAt" TIMESTAMP(3),
    "featuredUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "miniShopId" TEXT NOT NULL,
    "productTypeId" TEXT NOT NULL,
    "sizeId" TEXT,
    CONSTRAINT "mini_shop_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "mini_shop_product_photos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "miniShopProductId" TEXT NOT NULL,
    CONSTRAINT "mini_shop_product_photos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "mini_shop_product_tags" (
    "miniShopProductId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "mini_shop_product_tags_pkey" PRIMARY KEY ("miniShopProductId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "mini_shops_slug_key" ON "mini_shops"("slug");
CREATE INDEX IF NOT EXISTS "mini_shops_userId_idx" ON "mini_shops"("userId");
CREATE INDEX IF NOT EXISTS "mini_shops_slug_idx" ON "mini_shops"("slug");
CREATE INDEX IF NOT EXISTS "mini_shops_status_idx" ON "mini_shops"("status");

CREATE UNIQUE INDEX IF NOT EXISTS "mini_shop_products_slug_key" ON "mini_shop_products"("slug");
CREATE INDEX IF NOT EXISTS "mini_shop_products_miniShopId_idx" ON "mini_shop_products"("miniShopId");
CREATE INDEX IF NOT EXISTS "mini_shop_products_status_idx" ON "mini_shop_products"("status");
CREATE INDEX IF NOT EXISTS "mini_shop_products_productTypeId_idx" ON "mini_shop_products"("productTypeId");

CREATE INDEX IF NOT EXISTS "mini_shop_product_photos_miniShopProductId_idx" ON "mini_shop_product_photos"("miniShopProductId");

-- AddForeignKey
ALTER TABLE "mini_shops" ADD CONSTRAINT "mini_shops_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "mini_shop_products" ADD CONSTRAINT "mini_shop_products_miniShopId_fkey" FOREIGN KEY ("miniShopId") REFERENCES "mini_shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mini_shop_products" ADD CONSTRAINT "mini_shop_products_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "product_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "mini_shop_products" ADD CONSTRAINT "mini_shop_products_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "mini_shop_product_photos" ADD CONSTRAINT "mini_shop_product_photos_miniShopProductId_fkey" FOREIGN KEY ("miniShopProductId") REFERENCES "mini_shop_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mini_shop_product_tags" ADD CONSTRAINT "mini_shop_product_tags_miniShopProductId_fkey" FOREIGN KEY ("miniShopProductId") REFERENCES "mini_shop_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mini_shop_product_tags" ADD CONSTRAINT "mini_shop_product_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
