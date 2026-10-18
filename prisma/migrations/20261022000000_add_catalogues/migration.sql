-- Catalogues PDF + lien personnalisé pour les secteurs (ajouts uniquement, aucune suppression)

-- CreateTable
CREATE TABLE "Catalogue" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "coverUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Catalogue_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Sector" ADD COLUMN "link" TEXT;

-- Le secteur « Catalogues » ouvre désormais la bibliothèque de catalogues PDF
UPDATE "Sector" SET "link" = '/catalogues' WHERE "slug" = 'catalogues';
