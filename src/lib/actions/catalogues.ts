"use server";

import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";

export interface CatalogueFormState {
  error?: string;
  success?: boolean;
}

// Les fichiers doivent venir du stockage Blob de EGBM : on refuse toute autre adresse.
const BLOB_URL = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/\S+$/i;
const MAX_FILE_SIZE = 100 * 1024 * 1024;

function revalidateEverything() {
  revalidatePath("/", "layout");
}

// Suppression du fichier dans le stockage : jamais bloquante.
async function deleteBlobs(urls: Array<string | null | undefined>) {
  const toDelete = urls.filter((u): u is string => !!u && BLOB_URL.test(u));
  if (toDelete.length === 0) return;
  try {
    await del(toDelete);
  } catch (err) {
    console.error("Suppression du fichier de stockage impossible :", err);
  }
}

export async function saveCatalogueAction(
  _prevState: CatalogueFormState,
  formData: FormData
): Promise<CatalogueFormState> {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();
  const fileName = String(formData.get("fileName") ?? "").trim();
  const fileSize = Number(formData.get("fileSize") ?? 0);
  const coverUrl = String(formData.get("coverUrl") ?? "").trim();
  const active = formData.get("active") === "on";

  if (!title) {
    return { error: "Veuillez renseigner le titre du catalogue." };
  }
  if (!fileUrl || !BLOB_URL.test(fileUrl)) {
    return { error: "Veuillez ajouter le fichier PDF du catalogue." };
  }
  if (coverUrl && !BLOB_URL.test(coverUrl)) {
    return { error: "Image de couverture invalide." };
  }
  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
    return { error: "Taille du fichier invalide (100 Mo maximum)." };
  }

  const data = {
    title,
    description: description || null,
    fileUrl,
    fileName: fileName || "catalogue.pdf",
    fileSize: Math.round(fileSize),
    coverUrl: coverUrl || null,
    active,
  };

  if (id) {
    const existing = await prisma.catalogue.findUnique({
      where: { id },
      select: { fileUrl: true, coverUrl: true },
    });
    if (!existing) return { error: "Catalogue introuvable." };
    await prisma.catalogue.update({ where: { id }, data });
    // Les anciens fichiers remplacés sont effacés du stockage.
    await deleteBlobs([
      existing.fileUrl !== fileUrl ? existing.fileUrl : null,
      existing.coverUrl && existing.coverUrl !== data.coverUrl ? existing.coverUrl : null,
    ]);
  } else {
    await prisma.catalogue.create({ data });
  }

  revalidateEverything();
  return { success: true };
}

export async function toggleCatalogueActiveAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const catalogue = await prisma.catalogue.findUnique({ where: { id }, select: { active: true } });
  if (!catalogue) return;
  await prisma.catalogue.update({ where: { id }, data: { active: !catalogue.active } });
  revalidateEverything();
}

export async function deleteCatalogueAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const catalogue = await prisma.catalogue.findUnique({
    where: { id },
    select: { fileUrl: true, coverUrl: true },
  });
  if (!catalogue) return;
  await prisma.catalogue.delete({ where: { id } });
  await deleteBlobs([catalogue.fileUrl, catalogue.coverUrl]);
  revalidateEverything();
}
