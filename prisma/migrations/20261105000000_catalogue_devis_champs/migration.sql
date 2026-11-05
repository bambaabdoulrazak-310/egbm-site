-- Catalogue sans prix / demande de devis : colonnes facultatives uniquement (aucune suppression)

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "unit" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "clientCompany" TEXT;
ALTER TABLE "Order" ADD COLUMN "message" TEXT;

-- AlterTable
ALTER TABLE "QuoteRequest" ADD COLUMN "clientCompany" TEXT;
