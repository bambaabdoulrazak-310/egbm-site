import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminSecteursClient } from "@/components/entreprise/AdminSecteursClient";

export const metadata: Metadata = { title: "Secteurs — Espace Entreprise" };
export const revalidate = 0;

export default async function AdminSecteursPage() {
  const sectors = await prisma.sector.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <AdminSecteursClient
      sectors={sectors.map(({ _count, ...s }) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        description: s.description,
        photoUrl: s.photoUrl,
        icon: s.icon,
        active: s.active,
        productCount: _count.products,
      }))}
    />
  );
}
