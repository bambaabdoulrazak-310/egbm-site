import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminProduitsClient } from "@/components/entreprise/AdminProduitsClient";

export const metadata: Metadata = { title: "Produits — Espace Entreprise" };
export const revalidate = 0;

export default async function AdminProduitsPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { media: { orderBy: { order: "asc" } } },
  });
  return <AdminProduitsClient products={products} />;
}
