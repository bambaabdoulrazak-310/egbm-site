import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminCataloguesClient } from "@/components/entreprise/AdminCataloguesClient";

export const metadata: Metadata = { title: "Catalogues — Espace Entreprise" };
export const revalidate = 0;

export default async function AdminCataloguesPage() {
  const catalogues = await prisma.catalogue.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AdminCataloguesClient
      catalogues={catalogues.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        fileUrl: c.fileUrl,
        fileName: c.fileName,
        fileSize: c.fileSize,
        coverUrl: c.coverUrl,
        active: c.active,
        createdAt: c.createdAt.toISOString(),
      }))}
    />
  );
}
