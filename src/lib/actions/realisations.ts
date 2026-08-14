"use server";

import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";

export interface RealisationFormState {
  error?: string;
  success?: boolean;
}

const CATEGORIES = ["BTP", "AGRO_CHIMIQUE", "MATERIAUX_INDUSTRIELS"] as const;
const ALLOWED_PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function saveRealisationAction(
  _prevState: RealisationFormState,
  formData: FormData
): Promise<RealisationFormState> {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const photo = formData.get("photo");

  if (!title || !description) {
    return { error: "Veuillez renseigner un titre et une description." };
  }

  let photoUrl: string | undefined;
  if (photo instanceof File && photo.size > 0) {
    const ext = ALLOWED_PHOTO_TYPES[photo.type];
    if (!ext) {
      return { error: "Format de photo non supporté (jpg, png ou webp uniquement)." };
    }
    const blob = await put(`realisations/${randomUUID()}.${ext}`, photo, { access: "public" });
    photoUrl = blob.url;
  }

  const data = {
    title,
    description,
    location: location || null,
    category: CATEGORIES.includes(category as (typeof CATEGORIES)[number])
      ? (category as (typeof CATEGORIES)[number])
      : null,
    ...(photoUrl ? { photoUrl } : {}),
  };

  if (id) {
    await prisma.realisation.update({ where: { id }, data });
  } else {
    await prisma.realisation.create({ data });
  }

  revalidatePath("/espace-entreprise/realisations");
  revalidatePath("/realisations");
  revalidatePath("/");
  return { success: true };
}

export async function deleteRealisationAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.realisation.delete({ where: { id } });
  revalidatePath("/espace-entreprise/realisations");
  revalidatePath("/realisations");
  revalidatePath("/");
}
