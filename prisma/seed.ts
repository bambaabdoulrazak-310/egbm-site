import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Administrateur EGBM";

  if (!email || !password) {
    throw new Error(
      "SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD doivent être définis (dans .env.local) avant de lancer le seed."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "ADMINISTRATEUR" },
    create: { name, email, passwordHash, role: "ADMINISTRATEUR" },
  });

  console.log(`Compte Administrateur prêt : ${admin.email}`);

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        { name: "Ciment CPA 42.5 (sac 50kg)", category: "BTP", price: 5500, stock: 320, sold: 1450 },
        { name: "Fer à béton HA10 (barre 12m)", category: "BTP", price: 6800, stock: 180, sold: 620 },
        { name: "Gravier concassé 15/25 (tonne)", category: "BTP", price: 12000, stock: 40, sold: 210 },
        { name: "Engrais NPK 15-15-15 (sac 50kg)", category: "AGRO_CHIMIQUE", price: 21000, stock: 150, sold: 980 },
        { name: "Herbicide glyphosate (bidon 5L)", category: "AGRO_CHIMIQUE", price: 18500, stock: 90, sold: 540 },
        { name: "Insecticide cyperméthrine (1L)", category: "AGRO_CHIMIQUE", price: 6200, stock: 210, sold: 720 },
        { name: "Tôle bac acier galvanisé (feuille)", category: "MATERIAUX_INDUSTRIELS", price: 9800, stock: 75, sold: 310 },
        { name: "Contreplaqué marine 18mm (feuille)", category: "MATERIAUX_INDUSTRIELS", price: 15500, stock: 60, sold: 190 },
        { name: "Fil de fer recuit (rouleau 25kg)", category: "MATERIAUX_INDUSTRIELS", price: 22000, stock: 45, sold: 150 },
      ],
    });
    console.log("Produits de démonstration créés.");
  }

  const publicationCount = await prisma.publication.count();
  if (publicationCount === 0) {
    await prisma.publication.createMany({
      data: [
        {
          type: "EVENEMENT",
          title: "EGBM au Salon du Bâtiment de Korhogo",
          text: "Notre stand présentera la nouvelle gamme d'engrais NPK et nos solutions BTP.",
          date: new Date("2026-08-14"),
        },
        {
          type: "PUBLICATION",
          title: "Nouvel arrivage de fer à béton HA10",
          text: "Stock renouvelé — disponible en barres de 12m, livraison possible sur chantier.",
          date: new Date("2026-07-18"),
        },
      ],
    });
    console.log("Publications de démonstration créées.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
