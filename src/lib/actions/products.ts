"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";

export interface ProductFormState {
  error?: string;
  success?: boolean;
}

const CATEGORIES = ["BTP", "AGRO_CHIMIQUE", "MATERIAUX_INDUSTRIELS"] as const;
const ALLOWED_PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function savePhoto(file: File): Promise<string> {
  const ext = ALLOWED_PHOTO_TYPES[file.type];
  if (!ext) {
    throw new Error("Format de photo non supporté (jpg, png ou webp uniquement).");
  }
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadDir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/products/${filename}`;
}

export async function saveProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock") ?? 0);
  const description = String(formData.get("description") ?? "").trim();
  const photo = formData.get("photo");

  if (!name || !Number.isFinite(price) || price <= 0) {
    return { error: "Veuillez renseigner un nom et un prix valides." };
  }
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return { error: "Catégorie invalide." };
  }

  let photoUrl: string | undefined;
  if (photo instanceof File && photo.size > 0) {
    try {
      photoUrl = await savePhoto(photo);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Erreur lors de l'envoi de la photo." };
    }
  }

  const data = {
    name,
    category: category as (typeof CATEGORIES)[number],
    price: Math.round(price),
    stock: Math.max(0, Math.round(Number.isFinite(stock) ? stock : 0)),
    description: description || null,
    ...(photoUrl ? { photoUrl } : {}),
  };

  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    await prisma.product.create({ data });
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
