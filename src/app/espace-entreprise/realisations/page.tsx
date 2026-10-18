import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminRealisationsClient } from "@/components/entreprise/AdminRealisationsClient";

export const metadata: Metadata = { title: "Réalisations — Espace Entreprise" };
export const revalidate = 0;

export default async function AdminRealisationsPage() {
  const [realisations, sectors] = await Promise.all([
    prisma.realisation.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.sector.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  return <AdminRealisationsClient realisations={realisations} sectors={sectors} />;
}
