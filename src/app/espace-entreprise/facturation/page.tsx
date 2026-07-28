import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminFacturationClient } from "@/components/entreprise/AdminFacturationClient";

export const metadata: Metadata = { title: "Facturation — Espace Entreprise" };
export const revalidate = 0;

export default async function AdminFacturationPage() {
  const [products, documents] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, price: true } }),
    prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      select: { number: true, type: true, clientName: true, total: true },
    }),
  ]);

  return <AdminFacturationClient products={products} documents={documents} />;
}
