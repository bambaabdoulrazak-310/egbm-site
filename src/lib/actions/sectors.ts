"use server";

import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { slugify } from "@/lib/sectors";
import { SECTOR_ICON_KEYS } from "@/lib/sector-icons";
import { isValidSectorLink } from "@/lib/sector-link";

export interface SectorFormState {
  error?: string;
  success?: boolean;
}

const ALLOWED_PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Seul l'administrateur principal peut modifier les secteurs (requireAdmin dans chaque action).

// Les secteurs apparaissent partout (accueil, pied de page, filtres, formulaires) :
// on invalide tout le site d'un coup.
function revalidateEverything() {
  revalidatePath("/", "layout");
}

async function uniqueSlug(name: string) {
  const base = slugify(name) || "secteur";
  let slug = base;
  for (let n = 2; await prisma.sector.findUnique({ where: { slug } }); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function saveSectorAction(
  _prevState: SectorFormState,
  formData: FormData
): Promise<SectorFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "");
  const active = formData.get("active") === "on";
  const link = String(formData.get("link") ?? "").trim();
  const removePhoto = formData.get("removePhoto") === "on";
  const photo = formData.get("photo");

  if (!name) {
    return { error: "Veuillez renseigner le nom du secteur." };
  }

  if (link && !isValidSectorLink(link)) {
    return { error: "Le lien doit commencer par « / » (page du site) ou par « https:// »." };
  }

  let photoUrl: string | undefined;
  if (photo instanceof File && photo.size > 0) {
    const ext = ALLOWED_PHOTO_TYPES[photo.type];
    if (!ext) {
      return { error: "Format de photo non supporté (jpg, png ou webp uniquement)." };
    }
    const blob = await put(`secteurs/${randomUUID()}.${ext}`, photo, { access: "public" });
    photoUrl = blob.url;
  }

  const data = {
    name,
    description: description || null,
    icon: SECTOR_ICON_KEYS.includes(icon) ? icon : "Package",
    active,
    link: link || null,
    ...(photoUrl ? { photoUrl } : removePhoto ? { photoUrl: null } : {}),
  };

  if (id) {
    const existing = await prisma.sector.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return { error: "Secteur introuvable." };
    // Le slug (adresse du filtre) reste stable même si le nom change.
    await prisma.sector.update({ where: { id }, data });
  } else {
    const last = await prisma.sector.aggregate({ _max: { position: true } });
    await prisma.sector.create({
      data: { ...data, slug: await uniqueSlug(name), position: (last._max.position ?? -1) + 1 },
    });
  }

  revalidateEverything();
  return { success: true };
}

export async function moveSectorAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");

  const sectors = await prisma.sector.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const from = sectors.findIndex((s) => s.id === id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= sectors.length) return;

  [sectors[from], sectors[to]] = [sectors[to], sectors[from]];
  await prisma.$transaction(
    sectors.map((s, position) => prisma.sector.update({ where: { id: s.id }, data: { position } }))
  );
  revalidateEverything();
}

export async function toggleSectorActiveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const sector = await prisma.sector.findUnique({ where: { id }, select: { active: true } });
  if (!sector) return;
  await prisma.sector.update({ where: { id }, data: { active: !sector.active } });
  revalidateEverything();
}

export async function deleteSectorAction(
  _prevState: SectorFormState,
  formData: FormData
): Promise<SectorFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return {};

  const productCount = await prisma.product.count({ where: { sectorId: id } });
  if (productCount > 0) {
    return {
      error: `Ce secteur contient ${productCount} produit${productCount > 1 ? "s" : ""} : déplacez-${
        productCount > 1 ? "les" : "le"
      } d'abord vers un autre secteur.`,
    };
  }

  // Les réalisations rattachées sont simplement détachées (onDelete: SetNull).
  await prisma.sector.delete({ where: { id } });
  revalidateEverything();
  return { success: true };
}
