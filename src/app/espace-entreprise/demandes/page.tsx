import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminDemandesClient } from "@/components/entreprise/AdminDemandesClient";

export const metadata: Metadata = { title: "Demandes — Espace Entreprise" };
export const revalidate = 0;

export default async function AdminDemandesPage() {
  const [quotes, messages] = await Promise.all([
    prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return <AdminDemandesClient quotes={quotes} messages={messages} />;
}
