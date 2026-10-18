import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

// Le plan du site lit la base : on le régénère à chaque requête plutôt qu'au build.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "",
    "/produits",
    "/services",
    "/realisations",
    "/publications",
    "/devis",
    "/contact",
  ];

  const products = await prisma.product.findMany({ select: { id: true, updatedAt: true } });

  return [
    ...routes.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : 0.7,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/produits/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
