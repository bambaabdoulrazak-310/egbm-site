-- AlterTable: Document
ALTER TABLE "Document" ADD COLUMN "clientAddress" TEXT;
ALTER TABLE "Document" ADD COLUMN "objet" TEXT;
ALTER TABLE "Document" ADD COLUMN "vatApplicable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Document" ADD COLUMN "validityDays" INTEGER;

-- AlterTable: DocumentLine (backfill unitPriceGross from unitPrice before enforcing NOT NULL)
ALTER TABLE "DocumentLine" ADD COLUMN "unitPriceGross" INTEGER;
UPDATE "DocumentLine" SET "unitPriceGross" = "unitPrice" WHERE "unitPriceGross" IS NULL;
ALTER TABLE "DocumentLine" ALTER COLUMN "unitPriceGross" SET NOT NULL;
ALTER TABLE "DocumentLine" ADD COLUMN "discountPercent" INTEGER NOT NULL DEFAULT 0;
