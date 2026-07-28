import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminCommandesClient } from "@/components/entreprise/AdminCommandesClient";

export const metadata: Metadata = { title: "Commandes — Espace Entreprise" };
export const revalidate = 0;

export default async function AdminCommandesPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return <AdminCommandesClient orders={orders} />;
}
