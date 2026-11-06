"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { parseDateInput } from "@/lib/order-workflow";
import { completeDelivery, deliveredByItem, plannedByItem } from "@/lib/stock-service";

export interface DeliveryActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

const linesSchema = z
  .array(z.object({ orderItemId: z.string().min(1), quantity: z.number().int().positive().max(1_000_000) }))
  .min(1);

function refresh(orderId: string) {
  revalidatePath("/espace-entreprise/commandes");
  revalidatePath(`/espace-entreprise/commandes/${orderId}`);
  revalidatePath("/espace-entreprise");
  revalidatePath("/produits");
  revalidatePath("/espace-entreprise/produits");
}

// Prévoir une livraison (totale ou partielle) d'une commande confirmée.
export async function planDeliveryAction(
  _prev: DeliveryActionState,
  formData: FormData
): Promise<DeliveryActionState> {
  const session = await requireSession();

  const orderId = String(formData.get("orderId") ?? "");
  const dateRaw = String(formData.get("plannedDate") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);
  const plannedDate = dateRaw ? parseDateInput(dateRaw) : null;
  if (dateRaw && !plannedDate) return { error: "Date de livraison invalide." };

  let lines: z.infer<typeof linesSchema>;
  try {
    lines = linesSchema.parse(JSON.parse(String(formData.get("lines") ?? "[]")));
  } catch {
    return { error: "Indiquez au moins une quantité à livrer." };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return { error: "Commande introuvable." };
  if (!["CONFIRMEE", "EN_COURS", "EN_LIVRAISON"].includes(order.status)) {
    return { error: "On ne peut prévoir une livraison que pour une commande confirmée, en préparation ou en livraison." };
  }

  const result = await prisma.$transaction(async (tx) => {
    const delivered = await deliveredByItem(tx, orderId);
    const planned = await plannedByItem(tx, orderId);
    for (const l of lines) {
      const item = order.items.find((i) => i.id === l.orderItemId);
      if (!item) return { error: "Ligne de commande inconnue." };
      const remaining = item.quantity - (delivered.get(item.id) ?? 0) - (planned.get(item.id) ?? 0);
      if (l.quantity > remaining) {
        return { error: `« ${item.productName} » : il ne reste que ${Math.max(remaining, 0)} à planifier.` };
      }
    }
    await tx.delivery.create({
      data: {
        orderId,
        plannedDate,
        note: note || null,
        authorId: session.sub,
        authorName: session.name,
        lines: { create: lines },
      },
    });
    return null;
  });
  if (result) return result;

  refresh(orderId);
  return { success: true, message: "Livraison prévue enregistrée." };
}

async function loadDelivery(id: string) {
  return prisma.delivery.findUnique({
    where: { id },
    include: { lines: { include: { orderItem: true } }, order: true },
  });
}

// Marquer une livraison comme partie (expédition effectuée).
export async function startDeliveryAction(
  _prev: DeliveryActionState,
  formData: FormData
): Promise<DeliveryActionState> {
  const session = await requireSession();
  const id = String(formData.get("deliveryId") ?? "");
  const d = await loadDelivery(id);
  if (!d) return { error: "Livraison introuvable." };
  if (d.status !== "PREVUE") return { error: "Seule une livraison prévue peut être expédiée." };

  const ok = await prisma.$transaction(async (tx) => {
    const res = await tx.delivery.updateMany({ where: { id, status: "PREVUE" }, data: { status: "EN_COURS" } });
    if (res.count === 0) return false;
    const moveOrder = d.order.status === "CONFIRMEE" || d.order.status === "EN_COURS";
    if (moveOrder) {
      await tx.order.update({ where: { id: d.orderId }, data: { status: "EN_LIVRAISON" } });
    }
    await tx.orderEvent.create({
      data: {
        orderId: d.orderId,
        type: "EXPEDIEE",
        fromStatus: moveOrder ? d.order.status : null,
        toStatus: moveOrder ? "EN_LIVRAISON" : null,
        detail: `Livraison de ${d.lines.length} ligne(s) expédiée`,
        authorId: session.sub,
        authorName: session.name,
      },
    });
    return true;
  });
  if (!ok) return { error: "La livraison a été modifiée entre-temps. Rechargez la page." };

  refresh(d.orderId);
  return { success: true, message: "Livraison expédiée." };
}

// Confirmer qu'une livraison a bien été effectuée : le stock sort une seule fois.
export async function completeDeliveryAction(
  _prev: DeliveryActionState,
  formData: FormData
): Promise<DeliveryActionState> {
  const session = await requireSession();
  const id = String(formData.get("deliveryId") ?? "");
  const d = await loadDelivery(id);
  if (!d) return { error: "Livraison introuvable." };
  if (d.status !== "PREVUE" && d.status !== "EN_COURS") {
    return { error: "Cette livraison est déjà clôturée." };
  }
  if (!["CONFIRMEE", "EN_COURS", "EN_LIVRAISON"].includes(d.order.status)) {
    return { error: "La commande n'est plus en cours." };
  }

  const author = { id: session.sub, name: session.name };
  const ok = await prisma.$transaction(async (tx) => {
    // Garde : la livraison doit toujours être ouverte (évite un double clic ou deux utilisateurs).
    const res = await tx.delivery.updateMany({
      where: { id, status: { in: ["PREVUE", "EN_COURS"] } },
      data: { status: "EN_COURS" },
    });
    if (res.count === 0) return false;

    const { orderCompleted } = await completeDelivery(tx, id, author);
    const wasStatus = d.order.status;
    if (orderCompleted) {
      await tx.order.update({ where: { id: d.orderId }, data: { status: "LIVREE" } });
      await tx.orderEvent.create({
        data: {
          orderId: d.orderId,
          type: "LIVREE",
          fromStatus: wasStatus,
          toStatus: "LIVREE",
          detail: "Toutes les quantités ont été livrées",
          authorId: session.sub,
          authorName: session.name,
        },
      });
    } else {
      const moveOrder = wasStatus === "CONFIRMEE" || wasStatus === "EN_COURS";
      if (moveOrder) await tx.order.update({ where: { id: d.orderId }, data: { status: "EN_LIVRAISON" } });
      await tx.orderEvent.create({
        data: {
          orderId: d.orderId,
          type: "LIVRAISON_PARTIELLE",
          fromStatus: moveOrder ? wasStatus : null,
          toStatus: moveOrder ? "EN_LIVRAISON" : null,
          detail: `Livraison partielle de ${d.lines.length} ligne(s)`,
          authorId: session.sub,
          authorName: session.name,
        },
      });
    }
    return true;
  });
  if (!ok) return { error: "La livraison a été modifiée entre-temps. Rechargez la page." };

  refresh(d.orderId);
  return { success: true, message: "Livraison effectuée : le stock a été mis à jour." };
}

export async function cancelDeliveryAction(
  _prev: DeliveryActionState,
  formData: FormData
): Promise<DeliveryActionState> {
  await requireSession();
  const id = String(formData.get("deliveryId") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);
  if (note.length < 3) return { error: "Merci d'indiquer la raison de l'annulation." };

  const d = await prisma.delivery.findUnique({ where: { id } });
  if (!d) return { error: "Livraison introuvable." };

  const res = await prisma.delivery.updateMany({
    where: { id, status: { in: ["PREVUE", "EN_COURS"] } },
    data: { status: "ANNULEE", note },
  });
  if (res.count === 0) return { error: "Seule une livraison prévue ou en cours peut être annulée." };

  refresh(d.orderId);
  return { success: true, message: "Livraison annulée." };
}

// Report d'une livraison : justification obligatoire, ancienne date conservée dans l'historique de la commande.
export async function rescheduleDeliveryAction(
  _prev: DeliveryActionState,
  formData: FormData
): Promise<DeliveryActionState> {
  const session = await requireSession();
  const id = String(formData.get("deliveryId") ?? "");
  const newDate = parseDateInput(String(formData.get("date") ?? "").trim());
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);
  if (!newDate) return { error: "Merci de choisir une date valide." };

  const d = await prisma.delivery.findUnique({ where: { id } });
  if (!d) return { error: "Livraison introuvable." };
  if (d.status !== "PREVUE" && d.status !== "EN_COURS") {
    return { error: "Seule une livraison prévue ou en cours peut être reportée." };
  }
  if (d.plannedDate && d.plannedDate.getTime() === newDate.getTime()) {
    return { error: "Cette date est déjà celle de la livraison." };
  }
  if (d.plannedDate && note.length < 3) return { error: "Merci d'indiquer la raison du report." };

  await prisma.$transaction([
    prisma.delivery.update({ where: { id }, data: { plannedDate: newDate } }),
    prisma.orderEvent.create({
      data: {
        orderId: d.orderId,
        type: "DATE_MODIFIEE",
        oldDate: d.plannedDate,
        newDate,
        detail: "Date de livraison prévue modifiée",
        note: note || null,
        authorId: session.sub,
        authorName: session.name,
      },
    }),
  ]);

  refresh(d.orderId);
  return { success: true, message: "Date de livraison mise à jour." };
}
