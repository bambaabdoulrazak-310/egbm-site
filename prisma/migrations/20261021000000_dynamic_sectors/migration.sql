-- Secteurs d'activité dynamiques : l'enum "ProductCategory" est remplacée par la table "Sector".
-- Les produits et réalisations existants sont rattachés au secteur correspondant à leur
-- ancienne catégorie. Tout est exécuté d'un seul bloc : si une étape échoue (ex. un produit
-- sans secteur), rien n'est modifié.

-- CreateTable
CREATE TABLE "Sector" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "photoUrl" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'Package',
    "position" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sector_slug_key" ON "Sector"("slug");

-- Les 6 secteurs existants (mêmes noms, textes et photos qu'avant)
INSERT INTO "Sector" ("id", "slug", "name", "description", "photoUrl", "icon", "position", "updatedAt") VALUES
  ('sector_btp', 'btp', 'BTP', 'Matériaux de construction, équipements et accompagnement de vos chantiers.', '/btp-chantier.jpg', 'HardHat', 0, CURRENT_TIMESTAMP),
  ('sector_agro_chimique', 'agro-chimique', 'Agro-chimie', 'Semences, engrais et intrants agricoles pour une meilleure productivité.', '/agrochimie-secteur.webp', 'Leaf', 1, CURRENT_TIMESTAMP),
  ('sector_materiaux_industriels', 'materiaux-industriels', 'Matériaux industriels', 'Acier, fer, ciment et autres matériaux pour vos projets.', '/materiaux-industriels-secteur.jpg', 'Package', 2, CURRENT_TIMESTAMP),
  ('sector_equipements_miniers', 'equipements-miniers', 'Équipements miniers', 'Matériels et équipements pour les sites miniers.', '/equipements-miniers.jpg', 'Pickaxe', 3, CURRENT_TIMESTAMP),
  ('sector_catalogues', 'catalogues', 'Catalogues', 'Parcourez l''ensemble de nos produits et demandez un devis pour la référence qu''il vous faut.', NULL, 'BookOpen', 4, CURRENT_TIMESTAMP),
  ('sector_autres_services', 'autres-services', 'Autres services', 'Un besoin spécifique ? Contactez-nous, nous étudions votre demande.', NULL, 'Wrench', 5, CURRENT_TIMESTAMP);

-- Produits : nouvelle colonne, recopie depuis l'ancienne catégorie, puis obligatoire
ALTER TABLE "Product" ADD COLUMN "sectorId" TEXT;
UPDATE "Product" SET "sectorId" = CASE "category"::text
    WHEN 'BTP' THEN 'sector_btp'
    WHEN 'AGRO_CHIMIQUE' THEN 'sector_agro_chimique'
    WHEN 'MATERIAUX_INDUSTRIELS' THEN 'sector_materiaux_industriels'
    WHEN 'EQUIPEMENTS_MINIERS' THEN 'sector_equipements_miniers'
    WHEN 'CATALOGUES' THEN 'sector_catalogues'
    WHEN 'AUTRES_SERVICES' THEN 'sector_autres_services'
  END;
ALTER TABLE "Product" ALTER COLUMN "sectorId" SET NOT NULL;

-- Réalisations : le secteur reste facultatif
ALTER TABLE "Realisation" ADD COLUMN "sectorId" TEXT;
UPDATE "Realisation" SET "sectorId" = CASE "category"::text
    WHEN 'BTP' THEN 'sector_btp'
    WHEN 'AGRO_CHIMIQUE' THEN 'sector_agro_chimique'
    WHEN 'MATERIAUX_INDUSTRIELS' THEN 'sector_materiaux_industriels'
    WHEN 'EQUIPEMENTS_MINIERS' THEN 'sector_equipements_miniers'
    WHEN 'CATALOGUES' THEN 'sector_catalogues'
    WHEN 'AUTRES_SERVICES' THEN 'sector_autres_services'
  END
  WHERE "category" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Realisation" ADD CONSTRAINT "Realisation_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Suppression de l'ancien système (colonnes puis type)
ALTER TABLE "Product" DROP COLUMN "category";
ALTER TABLE "Realisation" DROP COLUMN "category";
DROP TYPE "ProductCategory";
