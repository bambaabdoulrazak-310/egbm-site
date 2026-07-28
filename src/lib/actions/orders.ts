"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";

export interface OrderState {
  error?: string;
  success?: boolean;
}

const cartSchema = z.record(z.string(), z.number().int().positive());

export async function createOrderAction(
  _prevState: OrderState,
  formData: FormData
): Promise<OrderState> {
  const nom = String(formData.get("nom") ?? "").trim();
  const tel = String(formData.get("tel") ?? "").trim();
  const adresse = String(formData.get("adresse") ?? "").trim();
  const panierRaw = String(formData.get("panier") ?? "{}");

  if (!nom || !tel) {
    return { error: "Veuillez renseigner votre nom et votre téléphone." };
  }

  let panier: Record<string, number>;
  try {
    panier = cartSchema.parse(JSON.parse(panierRaw));
  } catch {
    return { error: "Panier invalide." };
  }

  const productIds = Object.keys(panier);
  if (productIds.length === 0) {
    return { error: "Votre panier est vide." };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== productIds.length) {
    return { error: "Un ou plusieurs produits ne sont plus disponibles." };
  }

  const items = products.map((p) => ({
    productId: p.id,
    productName: p.name,
    quantity: panier[p.id],
    unitPrice: p.price,
  }));

  const total = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);

  await prisma.order.create({
    data: {
      clientName: nom,
      clientPhone: tel,
      clientAddress: adresse || null,
      total,
      status: "NOUVELLE",
      items: { create: items },
    },
  });

  return { success: true };
}

const STATUSES = ["NOUVELLE", "EN_COURS", "LIVREE"] as const;

export async function updateOrderStatusAction(formData: FormData) {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !STATUSES.includes(status as (typeof STATUSES)[number])) return;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return;

  const becomingDelivered = status === "LIVREE" && order.status !== "LIVREE";

  await prisma.$transaction([
    prisma.order.update({ where: { id }, data: { status: status as (typeof STATUSES)[number] } }),
    ...(becomingDelivered
      ? order.items
          .filter((it) => it.productId)
          .map((it) =>
            prisma.product.update({
              where: { id: it.productId! },
              data: {
                sold: { increment: it.quantity },
                stock: { decrement: it.quantity },
              },
            })
          )
      : []),
  ]);

  revalidatePath("/espace-entreprise/commandes");
  revalidatePath("/espace-entreprise");
  revalidatePath("/produits");
}
