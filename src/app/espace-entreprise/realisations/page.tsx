import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminRealisationsClient } from "@/components/entreprise/AdminRealisationsClient";

export const metadata: Metadata = { title: "Réalisations — Espace Entreprise" };
export const revalidate = 0;

export default async function AdminRealisationsPage() {
  const realisations = await prisma.realisation.findMany({ orderBy: { createdAt: "desc" } });
  return <AdminRealisationsClient realisations={realisations} />;
}
