-- Suivi des commandes (phase 1) : migration additive, aucune suppression ni modification de colonne existante.

-- Nouveaux statuts (les trois existants sont conservés)
ALTER TYPE "OrderStatus" ADD VALUE 'CONFIRMEE';
ALTER TYPE "OrderStatus" ADD VALUE 'EN_LIVRAISON';
ALTER TYPE "OrderStatus" ADD VALUE 'ANNULEE';

-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('SITE', 'MANUELLE', 'DEVIS');

-- CreateEnum
CREATE TYPE "OrderEventType" AS ENUM ('CREEE', 'CONFIRMEE', 'PREPARATION', 'EXPEDIEE', 'LIVREE', 'ANNULEE', 'REACTIVEE', 'DATE_MODIFIEE', 'RESPONSABLE_MODIFIE');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "reference" TEXT;
ALTER TABLE "Order" ADD COLUMN "source" "OrderSource" NOT NULL DEFAULT 'SITE';
ALTER TABLE "Order" ADD COLUMN "expectedDate" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "confirmedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "responsibleId" TEXT;

-- AlterTable
ALTER TABLE "QuoteRequest" ADD COLUMN "convertedOrderId" TEXT;

-- CreateTable
CREATE TABLE "OrderEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "OrderEventType" NOT NULL,
    "fromStatus" "OrderStatus",
    "toStatus" "OrderStatus",
    "oldDate" TIMESTAMP(3),
    "newDate" TIMESTAMP(3),
    "note" TEXT,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("id")
);

-- Références des commandes existantes (CMD-0001, CMD-0002…) dans l'ordre de création, et compteur associé
WITH numbered AS (
    SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS rn FROM "Order"
)
UPDATE "Order" o
SET "reference" = 'CMD-' || LPAD(n.rn::text, 4, '0')
FROM numbered n
WHERE o."id" = n."id";

INSERT INTO "DocumentCounter" ("id", "lastNo")
SELECT 'COMMANDE', COUNT(*) FROM "Order"
ON CONFLICT ("id") DO NOTHING;

-- CreateIndex
CREATE UNIQUE INDEX "Order_reference_key" ON "Order"("reference");
CREATE INDEX "OrderEvent_orderId_createdAt_idx" ON "OrderEvent"("orderId", "createdAt");
CREATE INDEX "OrderEvent_createdAt_idx" ON "OrderEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_convertedOrderId_fkey" FOREIGN KEY ("convertedOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
