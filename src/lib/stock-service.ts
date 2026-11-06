import "server-only";
import type { Prisma } from "@/generated/prisma/client";

// Toute variation de stock passe par ici : un mouvement est enregistré et le produit est mis à jour
// dans la même transaction. Les contraintes d'unicité (ligne de livraison / de réception + type)
// empêchent de compter deux fois la même opération.

export type Tx = Prisma.TransactionClient;

export interface Author {
  id: string | null;
  name: string;
}

interface MovementInput {
  productId: string;
  type: "LIVRAISON" | "RECEPTION" | "ANNULATION_LIVRAISON" | "REGULARISATION";
  // Quantité positive ; le sens (entrée/sortie) est déduit du type.
  quantity: number;
  deliveryLineId?: string;
  receiptLineId?: string;
  reference?: string | null;
  note?: string | null;
  author: Author;
}

export async function recordMovement(tx: Tx, m: MovementInput): Promise<void> {
  const outgoing = m.type === "LIVRAISON";
  const signed = outgoing ? -m.quantity : m.quantity;
  // « sold » suit les ventes réellement livrées : +q à la livraison, -q si elle est annulée.
  const soldDelta = m.type === "LIVRAISON" ? m.quantity : m.type === "ANNULATION_LIVRAISON" ? -m.quantity : 0;

  await tx.stockMovement.create({
    data: {
      productId: m.productId,
      type: m.type,
      quantity: signed,
      deliveryLineId: m.deliveryLineId,
      receiptLineId: m.receiptLineId,
      reference: m.reference ?? null,
      note: m.note ?? null,
      authorId: m.author.id,
      authorName: m.author.name,
    },
  });
  await tx.product.update({
    where: { id: m.productId },
    data: {
      stock: { increment: signed },
      ...(soldDelta !== 0 ? { sold: { increment: soldDelta } } : {}),
    },
  });
}

// Quantités déjà livrées (livraisons « effectuées ») par ligne de commande.
export async function deliveredByItem(tx: Tx, orderId: string): Promise<Map<string, number>> {
  const lines = await tx.deliveryLine.findMany({
    where: { delivery: { orderId, status: "EFFECTUEE" } },
    select: { orderItemId: true, quantity: true },
  });
  const map = new Map<string, number>();
  for (const l of lines) map.set(l.orderItemId, (map.get(l.orderItemId) ?? 0) + l.quantity);
  return map;
}

// Quantités prévues dans des livraisons encore ouvertes (prévues ou en cours).
export async function plannedByItem(
  tx: Tx,
  orderId: string,
  excludeDeliveryId?: string
): Promise<Map<string, number>> {
  const lines = await tx.deliveryLine.findMany({
    where: {
      delivery: {
        orderId,
        status: { in: ["PREVUE", "EN_COURS"] },
        ...(excludeDeliveryId ? { id: { not: excludeDeliveryId } } : {}),
      },
    },
    select: { orderItemId: true, quantity: true },
  });
  const map = new Map<string, number>();
  for (const l of lines) map.set(l.orderItemId, (map.get(l.orderItemId) ?? 0) + l.quantity);
  return map;
}

// Valide une livraison : sortie de stock une seule fois par ligne, puis mise à jour de la commande.
export async function completeDelivery(
  tx: Tx,
  deliveryId: string,
  author: Author
): Promise<{ orderCompleted: boolean; partial: boolean }> {
  const delivery = await tx.delivery.findUniqueOrThrow({
    where: { id: deliveryId },
    include: { lines: { include: { orderItem: true } }, order: { include: { items: true } } },
  });

  for (const line of delivery.lines) {
    if (!line.orderItem.productId) continue;
    await recordMovement(tx, {
      productId: line.orderItem.productId,
      type: "LIVRAISON",
      quantity: line.quantity,
      deliveryLineId: line.id,
      reference: delivery.order.reference,
      author,
    });
  }

  await tx.delivery.update({
    where: { id: deliveryId },
    data: { status: "EFFECTUEE", deliveredAt: new Date() },
  });

  const delivered = await deliveredByItem(tx, delivery.orderId);
  const orderCompleted = delivery.order.items.every((it) => (delivered.get(it.id) ?? 0) >= it.quantity);
  return { orderCompleted, partial: !orderCompleted };
}

// Passage manuel d'une commande à « Livrée » : on livre uniquement le reste à livrer
// (jamais les quantités déjà sorties du stock par une livraison précédente).
export async function settleRemainingDelivery(
  tx: Tx,
  orderId: string,
  author: Author
): Promise<void> {
  const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
  const delivered = await deliveredByItem(tx, orderId);

  const lines = order.items
    .map((it) => ({ orderItemId: it.id, quantity: it.quantity - (delivered.get(it.id) ?? 0) }))
    .filter((l) => l.quantity > 0);
  if (lines.length === 0) return;

  // Les livraisons encore ouvertes sont remplacées par cette livraison finale.
  await tx.delivery.updateMany({
    where: { orderId, status: { in: ["PREVUE", "EN_COURS"] } },
    data: { status: "ANNULEE", note: "Remplacée par la livraison finale de la commande" },
  });

  const delivery = await tx.delivery.create({
    data: {
      orderId,
      status: "PREVUE",
      note: "Livraison du reste de la commande (passage à « Livrée »)",
      authorId: author.id,
      authorName: author.name,
      lines: { create: lines },
    },
  });
  await completeDelivery(tx, delivery.id, author);
}

// Réactivation d'une commande livrée : les sorties de stock sont annulées une seule fois.
export async function reverseDeliveries(tx: Tx, orderId: string, author: Author): Promise<void> {
  const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
  const deliveries = await tx.delivery.findMany({
    where: { orderId, status: "EFFECTUEE" },
    include: { lines: { include: { orderItem: true } } },
  });

  if (deliveries.length === 0) {
    // Commande livrée avant le suivi des livraisons : on remet les quantités commandées.
    for (const it of order.items) {
      if (!it.productId) continue;
      await recordMovement(tx, {
        productId: it.productId,
        type: "REGULARISATION",
        quantity: it.quantity,
        reference: order.reference,
        note: "Annulation de la livraison (commande livrée avant le suivi des livraisons)",
        author,
      });
      // Les ventes comptées à l'ancienne livraison sont aussi retirées.
      await tx.product.update({ where: { id: it.productId }, data: { sold: { decrement: it.quantity } } });
    }
    return;
  }

  for (const d of deliveries) {
    for (const line of d.lines) {
      if (!line.orderItem.productId) continue;
      await recordMovement(tx, {
        productId: line.orderItem.productId,
        type: "ANNULATION_LIVRAISON",
        quantity: line.quantity,
        deliveryLineId: line.id,
        reference: order.reference,
        note: "Commande réactivée",
        author,
      });
    }
    await tx.delivery.update({
      where: { id: d.id },
      data: { status: "ANNULEE", note: "Annulée : commande réactivée" },
    });
  }
}
