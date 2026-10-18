import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminProduitsClient } from "@/components/entreprise/AdminProduitsClient";

export const metadata: Metadata = { title: "Produits — Espace Entreprise" };
export const revalidate = 0;

export default async function AdminProduitsPage() {
  const [products, sectors] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
      include: {
        media: { orderBy: { order: "asc" } },
        sector: { select: { name: true } },
      },
    }),
    prisma.sector.findMany({
      where: { link: null },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  return <AdminProduitsClient products={products} sectors={sectors} />;
}
