import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminFacturationClient } from "@/components/entreprise/AdminFacturationClient";

export const metadata: Metadata = { title: "Facturation — Espace Entreprise" };
export const revalidate = 0;

const PREFIXES = { FACTURE: "FAC", PROFORMA: "PRO", DEVIS: "DEV" } as const;

export default async function AdminFacturationPage() {
  const [products, documents, counters] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, price: true } }),
    prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      select: { number: true, type: true, clientName: true, total: true },
    }),
    prisma.documentCounter.findMany(),
  ]);

  const year = new Date().getFullYear();
  const nextNumberHints = Object.fromEntries(
    (Object.keys(PREFIXES) as Array<keyof typeof PREFIXES>).map((type) => {
      const counter = counters.find((c) => c.id === `${type}-${year}`);
      const nextNo = (counter?.lastNo ?? 0) + 1;
      return [type, `${PREFIXES[type]}-${year}-${String(nextNo).padStart(3, "0")}`];
    })
  ) as Record<keyof typeof PREFIXES, string>;

  return (
    <AdminFacturationClient products={products} documents={documents} nextNumberHints={nextNumberHints} />
  );
}
