"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { parseDateInput } from "@/lib/order-workflow";
import {
  SUPPLIER_EVENT_FOR_STATUS,
  SUPPLIER_LABELS,
  canReceive,
  canSupplierTransition,
  isSupplierBackward,
  isSupplierStatus,
  isSupplierTerminal,
} from "@/lib/supplier-workflow";
import { recordMovement } from "@/lib/stock-service";

export interface SupplierActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

function refresh(id?: string) {
  revalidatePath("/espace-entreprise/commandes");
  if (id) revalidatePath(`/espace-entreprise/commandes/fournisseurs/${id}`);
  revalidatePath("/espace-entreprise");
  revalidatePath("/produits");
  revalidatePath("/espace-entreprise/produits");
}

const note = (formData: FormData) => String(formData.get("note") ?? "").trim().slice(0, 1000);

const createLinesSchema = z
  .array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive().max(1_000_000),
    })
  )
  .min(1);

export async function createSupplierOrderAction(
  _prev: SupplierActionState,
  formData: FormData
): Promise<SupplierActionState> {
  const session = await requireSession();

  const supplierName = String(formData.get("supplierName") ?? "").trim().slice(0, 150);
  const supplierContact = String(formData.get("supplierContact") ?? "").trim().slice(0, 150);
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 2000);
  const dateRaw = String(formData.get("expectedDate") ?? "").trim();
  const responsibleId = String(formData.get("responsibleId") ?? "");
  if (!supplierName) return { error: "Veuillez indiquer le nom du fournisseur." };
  const expectedDate = dateRaw ? parseDateInput(dateRaw) : null;
  if (dateRaw && !expectedDate) return { error: "Date prévue invalide." };

  let lines: z.infer<typeof createLinesSchema>;
  try {
    lines = createLinesSchema.parse(JSON.parse(String(formData.get("lines") ?? "[]")));
  } catch {
    return { error: "Ajoutez au moins un produit avec une quantité valide." };
  }
  const merged = new Map<string, number>();
  for (const l of lines) merged.set(l.productId, (merged.get(l.productId) ?? 0) + l.quantity);

  const products = await prisma.product.findMany({ where: { id: { in: [...merged.keys()] } } });
  if (products.length !== merged.size) return { error: "Un ou plusieurs produits n'existent plus." };
  if (responsibleId) {
    const u = await prisma.user.findUnique({ where: { id: responsibleId }, select: { id: true } });
    if (!u) return { error: "Employé responsable introuvable." };
  }

  const id = await prisma.$transaction(async (tx) => {
    const counter = await tx.documentCounter.upsert({
      where: { id: "APPRO" },
      create: { id: "APPRO", lastNo: 1 },
      update: { lastNo: { increment: 1 } },
    });
    const order = await tx.supplierOrder.create({
      data: {
        reference: `APP-${String(counter.lastNo).padStart(4, "0")}`,
        supplierName,
        supplierContact: supplierContact || null,
        notes: notes || null,
        expectedDate,
        responsibleId: responsibleId || null,
        items: {
          create: products.map((p) => ({
            productId: p.id,
            productName: p.name,
            quantity: merged.get(p.id)!,
          })),
        },
        events: {
          create: {
            type: "CREEE",
            detail: "Commande fournisseur créée (brouillon)",
            authorId: session.sub,
            authorName: session.name,
          },
        },
      },
    });
    return order.id;
  });

  refresh(id);
  redirect(`/espace-entreprise/commandes/fournisseurs/${id}`);
}

export async function changeSupplierStatusAction(
  _prev: SupplierActionState,
  formData: FormData
): Promise<SupplierActionState> {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  const to = String(formData.get("to") ?? "");
  const obs = note(formData);
  if (!id || !isSupplierStatus(to)) return { error: "Demande invalide." };

  const order = await prisma.supplierOrder.findUnique({ where: { id } });
  if (!order) return { error: "Commande introuvable." };
  if (!canSupplierTransition(order.status, to)) {
    return { error: "Ce changement de statut n'est pas autorisé pour cette commande." };
  }
  if (to === "ANNULEE" && obs.length < 3) {
    return { error: "Merci d'indiquer la raison (observation obligatoire pour une annulation)." };
  }

  const backward = isSupplierBackward(order.status, to);
  const ok = await prisma.$transaction(async (tx) => {
    const res = await tx.supplierOrder.updateMany({ where: { id, status: order.status }, data: { status: to } });
    if (res.count === 0) return false;
    await tx.orderEvent.create({
      data: {
        supplierOrderId: id,
        type: SUPPLIER_EVENT_FOR_STATUS[to],
        detail: backward
          ? `Retour au statut « ${SUPPLIER_LABELS[to]} »`
          : `${SUPPLIER_LABELS[order.status]} → ${SUPPLIER_LABELS[to]}`,
        note: obs || null,
        authorId: session.sub,
        authorName: session.name,
      },
    });
    return true;
  });
  if (!ok) return { error: "La commande a été modifiée entre-temps. Rechargez la page." };

  refresh(id);
  return { success: true, message: `Statut mis à jour : ${SUPPLIER_LABELS[to]}` };
}

// Réactivation d'une commande fournisseur annulée : administrateur seul, justification obligatoire,
// et uniquement si rien n'a été reçu (sinon le stock serait incohérent).
export async function reactivateSupplierOrderAction(
  _prev: SupplierActionState,
  formData: FormData
): Promise<SupplierActionState> {
  const session = await requireSession();
  if (session.role !== "ADMINISTRATEUR") {
    return { error: "Seul un administrateur peut réactiver une commande annulée." };
  }
  const id = String(formData.get("id") ?? "");
  const obs = note(formData);
  if (obs.length < 5) return { error: "Une justification est obligatoire pour réactiver une commande." };

  const order = await prisma.supplierOrder.findUnique({ where: { id }, include: { receipts: { select: { id: true } } } });
  if (!order) return { error: "Commande introuvable." };
  if (order.status !== "ANNULEE") {
    return { error: "Seule une commande annulée peut être réactivée (une commande reçue est définitive)." };
  }
  if (order.receipts.length > 0) {
    return { error: "Des marchandises ont déjà été reçues : cette commande ne peut pas être réactivée." };
  }

  const ok = await prisma.$transaction(async (tx) => {
    const res = await tx.supplierOrder.updateMany({ where: { id, status: "ANNULEE" }, data: { status: "BROUILLON" } });
    if (res.count === 0) return false;
    await tx.orderEvent.create({
      data: {
        supplierOrderId: id,
        type: "REACTIVEE",
        detail: "Commande réactivée (retour à « Brouillon »)",
        note: obs,
        authorId: session.sub,
        authorName: session.name,
      },
    });
    return true;
  });
  if (!ok) return { error: "La commande a été modifiée entre-temps. Rechargez la page." };

  refresh(id);
  return { success: true, message: "Commande réactivée." };
}

const receiveSchema = z
  .array(z.object({ itemId: z.string().min(1), quantity: z.number().int().positive().max(1_000_000) }))
  .min(1);

// Réception de marchandises (totale ou partielle) : le stock entre une seule fois par ligne.
export async function receiveGoodsAction(
  _prev: SupplierActionState,
  formData: FormData
): Promise<SupplierActionState> {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  const obs = note(formData);

  let lines: z.infer<typeof receiveSchema>;
  try {
    lines = receiveSchema.parse(JSON.parse(String(formData.get("lines") ?? "[]")));
  } catch {
    return { error: "Indiquez au moins une quantité reçue." };
  }

  const order = await prisma.supplierOrder.findUnique({ where: { id }, include: { items: true } });
  if (!order) return { error: "Commande introuvable." };
  if (!canReceive(order.status)) {
    return { error: "Cette commande doit d'abord être envoyée au fournisseur (et ne doit pas être terminée)." };
  }

  const author = { id: session.sub, name: session.name };
  const result = await prisma.$transaction(async (tx) => {
    const fresh = await tx.supplierOrder.findUniqueOrThrow({ where: { id }, include: { items: true } });
    if (!canReceive(fresh.status)) return { error: "La commande a été modifiée entre-temps. Rechargez la page." };

    for (const l of lines) {
      const item = fresh.items.find((i) => i.id === l.itemId);
      if (!item) return { error: "Ligne de commande inconnue." };
      if (l.quantity > item.quantity - item.receivedQty) {
        return { error: `« ${item.productName} » : il ne reste que ${item.quantity - item.receivedQty} à recevoir.` };
      }
    }

    const receipt = await tx.supplierReceipt.create({
      data: { supplierOrderId: id, note: obs || null, authorId: author.id, authorName: author.name },
    });
    for (const l of lines) {
      const item = fresh.items.find((i) => i.id === l.itemId)!;
      const line = await tx.supplierReceiptLine.create({
        data: { receiptId: receipt.id, itemId: item.id, quantity: l.quantity },
      });
      await tx.supplierOrderItem.update({
        where: { id: item.id },
        data: { receivedQty: { increment: l.quantity } },
      });
      if (item.productId) {
        await recordMovement(tx, {
          productId: item.productId,
          type: "RECEPTION",
          quantity: l.quantity,
          receiptLineId: line.id,
          reference: fresh.reference,
          note: `Fournisseur : ${fresh.supplierName}`,
          author,
        });
      }
    }

    const updated = await tx.supplierOrderItem.findMany({ where: { supplierOrderId: id } });
    const complete = updated.every((i) => i.receivedQty >= i.quantity);
    const to = complete ? "RECUE" : "RECUE_PARTIELLEMENT";
    await tx.supplierOrder.update({ where: { id }, data: { status: to } });
    await tx.orderEvent.create({
      data: {
        supplierOrderId: id,
        type: complete ? "RECEPTION" : "RECEPTION_PARTIELLE",
        detail: `${SUPPLIER_LABELS[fresh.status]} → ${SUPPLIER_LABELS[to]} (${lines.length} ligne(s) reçue(s))`,
        note: obs || null,
        authorId: author.id,
        authorName: author.name,
      },
    });
    return null;
  });
  if (result) return result;

  refresh(id);
  return { success: true, message: "Réception enregistrée : le stock a été mis à jour." };
}

export async function updateSupplierDateAction(
  _prev: SupplierActionState,
  formData: FormData
): Promise<SupplierActionState> {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  const newDate = parseDateInput(String(formData.get("date") ?? "").trim());
  const obs = note(formData);
  if (!id || !newDate) return { error: "Merci de choisir une date valide." };

  const order = await prisma.supplierOrder.findUnique({ where: { id } });
  if (!order) return { error: "Commande introuvable." };
  if (isSupplierTerminal(order.status)) {
    return { error: "La date d'une commande terminée ou annulée ne peut pas être modifiée." };
  }
  if (order.expectedDate && order.expectedDate.getTime() === newDate.getTime()) {
    return { error: "Cette date est déjà celle de la commande." };
  }
  if (order.expectedDate && obs.length < 3) return { error: "Merci d'indiquer la raison du changement de date." };

  await prisma.$transaction([
    prisma.supplierOrder.update({ where: { id }, data: { expectedDate: newDate } }),
    prisma.orderEvent.create({
      data: {
        supplierOrderId: id,
        type: "DATE_MODIFIEE",
        oldDate: order.expectedDate,
        newDate,
        note: obs || null,
        authorId: session.sub,
        authorName: session.name,
      },
    }),
  ]);

  refresh(id);
  return { success: true, message: "Date prévue mise à jour." };
}

export async function assignSupplierResponsibleAction(
  _prev: SupplierActionState,
  formData: FormData
): Promise<SupplierActionState> {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  const responsibleId = String(formData.get("responsibleId") ?? "");

  const order = await prisma.supplierOrder.findUnique({
    where: { id },
    include: { responsible: { select: { name: true } } },
  });
  if (!order) return { error: "Commande introuvable." };
  if (isSupplierTerminal(order.status)) {
    return { error: "Une commande terminée ou annulée ne peut plus être réaffectée." };
  }
  let newName = "Aucun";
  if (responsibleId) {
    const u = await prisma.user.findUnique({ where: { id: responsibleId }, select: { name: true } });
    if (!u) return { error: "Employé introuvable." };
    newName = u.name;
  }
  if ((order.responsibleId ?? "") === responsibleId) return { error: "Ce responsable est déjà affecté." };

  await prisma.$transaction([
    prisma.supplierOrder.update({ where: { id }, data: { responsibleId: responsibleId || null } }),
    prisma.orderEvent.create({
      data: {
        supplierOrderId: id,
        type: "RESPONSABLE_MODIFIE",
        note: `${order.responsible?.name ?? "Aucun"} → ${newName}`,
        authorId: session.sub,
        authorName: session.name,
      },
    }),
  ]);

  refresh(id);
  return { success: true, message: "Responsable mis à jour." };
}
