import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminAvisClient } from "@/components/entreprise/AdminAvisClient";

export const metadata: Metadata = { title: "Avis clients — Espace Entreprise" };
export const revalidate = 0;

export default async function AdminAvisPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true } }, customer: { select: { name: true } } },
  });
  return <AdminAvisClient reviews={reviews} />;
}
