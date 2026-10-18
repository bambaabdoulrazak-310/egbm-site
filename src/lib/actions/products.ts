"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";

export interface ProductFormState {
  error?: string;
  success?: boolean;
}

const mediaSchema = z.array(
  z.object({
    url: z.string().url(),
    type: z.enum(["IMAGE", "VIDEO"]),
  })
);

export async function saveProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const sectorId = String(formData.get("sectorId") ?? "");
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock") ?? 0);
  const description = String(formData.get("description") ?? "").trim();
  const mediaRaw = String(formData.get("media") ?? "[]");

  if (!name || !Number.isFinite(price) || price <= 0) {
    return { error: "Veuillez renseigner un nom et un prix valides." };
  }
  const sector = sectorId
    ? await prisma.sector.findUnique({ where: { id: sectorId }, select: { id: true } })
    : null;
  if (!sector) {
    return { error: "Secteur invalide." };
  }

  let media: z.infer<typeof mediaSchema>;
  try {
    media = mediaSchema.parse(JSON.parse(mediaRaw));
  } catch {
    return { error: "Photos/vidéos invalides." };
  }

  const data = {
    name,
    sectorId: sector.id,
    price: Math.round(price),
    stock: Math.max(0, Math.round(Number.isFinite(stock) ? stock : 0)),
    description: description || null,
  };
  const mediaCreate = media.map((m, index) => ({ url: m.url, type: m.type, order: index }));

  if (id) {
    await prisma.$transaction([
      prisma.productMedia.deleteMany({ where: { productId: id } }),
      prisma.product.update({
        where: { id },
        data: { ...data, media: { create: mediaCreate } },
      }),
    ]);
  } else {
    await prisma.product.create({ data: { ...data, media: { create: mediaCreate } } });
  }

  revalidatePath("/espace-entreprise/produits");
  revalidatePath("/produits");
  revalidatePath("/");
  return { success: true };
}

export async function deleteProductAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.product.delete({ where: { id } });
  revalidatePath("/espace-entreprise/produits");
  revalidatePath("/produits");
}
