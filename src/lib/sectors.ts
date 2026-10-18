import "server-only";
import { prisma } from "@/lib/prisma";

export interface PublicSector {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  icon: string;
}

// Secteurs visibles sur le site public, dans l'ordre choisi dans l'espace entreprise.
export async function getActiveSectors(): Promise<PublicSector[]> {
  return prisma.sector.findMany({
    where: { active: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true, slug: true, name: true, description: true, photoUrl: true, icon: true },
  });
}

// "Matériaux industriels" -> "materiaux-industriels"
export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Accepte un slug ("agro-chimique") et les anciens codes d'URL ("AGRO_CHIMIQUE").
export function normalizeSectorParam(param: string | undefined) {
  if (!param) return undefined;
  return param.trim().toLowerCase().replace(/_/g, "-") || undefined;
}
