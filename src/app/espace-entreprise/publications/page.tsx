import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminPublicationsClient } from "@/components/entreprise/AdminPublicationsClient";

export const metadata: Metadata = { title: "Publications — Espace Entreprise" };
export const revalidate = 0;

export default async function AdminPublicationsPage() {
  const publications = await prisma.publication.findMany({ orderBy: { date: "desc" } });
  return <AdminPublicationsClient publications={publications} />;
}
