-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "aboutConfig" JSONB,
ADD COLUMN     "bannerReservarButtonActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "footerConfig" JSONB,
ADD COLUMN     "socialLinks" JSONB;
