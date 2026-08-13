-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "ProductMedia" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: migrate existing Product.photoUrl values into ProductMedia before dropping the column
INSERT INTO "ProductMedia" ("id", "productId", "url", "type", "order", "createdAt")
SELECT gen_random_uuid()::text, "id", "photoUrl", 'IMAGE', 0, CURRENT_TIMESTAMP
FROM "Product"
WHERE "photoUrl" IS NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "photoUrl";
