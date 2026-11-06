-- Suivi des commandes (phase 2) : livraisons, commandes fournisseurs, historique de stock.
-- Migration additive : seules des tables/colonnes sont ajoutées (et OrderEvent.orderId devient facultatif).

-- Nouveaux types d'événements
ALTER TYPE "OrderEventType" ADD VALUE 'ENVOYEE';
ALTER TYPE "OrderEventType" ADD VALUE 'LIVRAISON_PARTIELLE';
ALTER TYPE "OrderEventType" ADD VALUE 'RECEPTION_PARTIELLE';
ALTER TYPE "OrderEventType" ADD VALUE 'RECEPTION';

-- CreateEnum
CREATE TYPE "SupplierOrderStatus" AS ENUM ('BROUILLON', 'ENVOYEE', 'CONFIRMEE', 'EXPEDIEE', 'RECUE_PARTIELLEMENT', 'RECUE', 'ANNULEE');
CREATE TYPE "DeliveryStatus" AS ENUM ('PREVUE', 'EN_COURS', 'EFFECTUEE', 'ANNULEE');
CREATE TYPE "StockMovementType" AS ENUM ('LIVRAISON', 'RECEPTION', 'ANNULATION_LIVRAISON', 'REGULARISATION');

-- AlterTable : un événement peut maintenant concerner une commande fournisseur
ALTER TABLE "OrderEvent" ALTER COLUMN "orderId" DROP NOT NULL;
ALTER TABLE "OrderEvent" ADD COLUMN "supplierOrderId" TEXT;
ALTER TABLE "OrderEvent" ADD COLUMN "detail" TEXT;

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "plannedDate" TIMESTAMP(3),
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PREVUE',
    "deliveredAt" TIMESTAMP(3),
    "note" TEXT,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeliveryLine" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "DeliveryLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupplierOrder" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "supplierContact" TEXT,
    "status" "SupplierOrderStatus" NOT NULL DEFAULT 'BROUILLON',
    "expectedDate" TIMESTAMP(3),
    "notes" TEXT,
    "responsibleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupplierOrderItem" (
    "id" TEXT NOT NULL,
    "supplierOrderId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "receivedQty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SupplierOrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupplierReceipt" (
    "id" TEXT NOT NULL,
    "supplierOrderId" TEXT NOT NULL,
    "note" TEXT,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierReceipt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupplierReceiptLine" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "SupplierReceiptLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "deliveryLineId" TEXT,
    "receiptLineId" TEXT,
    "reference" TEXT,
    "note" TEXT,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderEvent_supplierOrderId_createdAt_idx" ON "OrderEvent"("supplierOrderId", "createdAt");
CREATE INDEX "Delivery_orderId_idx" ON "Delivery"("orderId");
CREATE INDEX "Delivery_status_plannedDate_idx" ON "Delivery"("status", "plannedDate");
CREATE UNIQUE INDEX "SupplierOrder_reference_key" ON "SupplierOrder"("reference");
CREATE INDEX "StockMovement_productId_createdAt_idx" ON "StockMovement"("productId", "createdAt");
CREATE UNIQUE INDEX "StockMovement_deliveryLineId_type_key" ON "StockMovement"("deliveryLineId", "type");
CREATE UNIQUE INDEX "StockMovement_receiptLineId_type_key" ON "StockMovement"("receiptLineId", "type");

-- AddForeignKey
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_supplierOrderId_fkey" FOREIGN KEY ("supplierOrderId") REFERENCES "SupplierOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeliveryLine" ADD CONSTRAINT "DeliveryLine_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeliveryLine" ADD CONSTRAINT "DeliveryLine_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupplierOrder" ADD CONSTRAINT "SupplierOrder_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SupplierOrderItem" ADD CONSTRAINT "SupplierOrderItem_supplierOrderId_fkey" FOREIGN KEY ("supplierOrderId") REFERENCES "SupplierOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupplierOrderItem" ADD CONSTRAINT "SupplierOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SupplierReceipt" ADD CONSTRAINT "SupplierReceipt_supplierOrderId_fkey" FOREIGN KEY ("supplierOrderId") REFERENCES "SupplierOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupplierReceiptLine" ADD CONSTRAINT "SupplierReceiptLine_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "SupplierReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupplierReceiptLine" ADD CONSTRAINT "SupplierReceiptLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "SupplierOrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_deliveryLineId_fkey" FOREIGN KEY ("deliveryLineId") REFERENCES "DeliveryLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_receiptLineId_fkey" FOREIGN KEY ("receiptLineId") REFERENCES "SupplierReceiptLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
