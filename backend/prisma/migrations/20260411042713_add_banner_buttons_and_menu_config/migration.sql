-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "bannerBuyerButtonActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "bannerSellerButtonActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "menuConfig" JSONB;
