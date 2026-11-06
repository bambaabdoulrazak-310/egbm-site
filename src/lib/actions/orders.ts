"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { getCustomerSession } from "@/lib/customer-session";
import { notifyNewOrder } from "@/lib/notify";
import { isLikelySpam } from "@/lib/antispam";
import {
  EVENT_FOR_STATUS,
  NOTE_REQUIRED_FOR,
  STATUS_LABELS,
  REACTIVATION_TARGET,
  canTransition,
  isStatus,
  isTerminal,
  parseDateInput,
} from "@/lib/order-workflow";

export interface OrderState {
  error?: string;
  success?: boolean;
}

export interface OrderActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

const cartSchema = z.record(z.string(), z.number().int().positive());

type Tx = Prisma.TransactionClient;

// Référence lisible CMD-0001… (compteur transactionnel déjà utilisé par la facturation).
async function nextOrderReference(tx: Tx): Promise<string> {
  const counter = await tx.documentCounter.upsert({
    where: { id: "COMMANDE" },
    create: { id: "COMMANDE", lastNo: 1 },
    update: { lastNo: { increment: 1 } },
  });
  return `CMD-${String(counter.lastNo).padStart(4, "0")}`;
}

function revalidateOrders(orderId?: string) {
  revalidatePath("/espace-entreprise/commandes");
  if (orderId) revalidatePath(`/espace-entreprise/commandes/${orderId}`);
  revalidatePath("/espace-entreprise");
  revalidatePath("/espace-entreprise/demandes");
}

export async function createOrderAction(
  _prevState: OrderState,
  formData: FormData
): Promise<OrderState> {
  const nom = String(formData.get("nom") ?? "").trim();
  const tel = String(formData.get("tel") ?? "").trim();
  const adresse = String(formData.get("adresse") ?? "").trim();
  // Facultatifs : ajoutés à la demande de devis, sans effet sur les règles du formulaire.
  const entreprise = String(formData.get("entreprise") ?? "").trim().slice(0, 150);
  const message = String(formData.get("message") ?? "").trim().slice(0, 2000);
  const panierRaw = String(formData.get("panier") ?? "{}");

  if (!nom || !tel) {
    return { error: "Veuillez renseigner votre nom et votre téléphone." };
  }

  if (isLikelySpam(formData)) {
    return { success: true };
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

  const customerSession = await getCustomerSession();

  await prisma.$transaction(async (tx) => {
    const reference = await nextOrderReference(tx);
    await tx.order.create({
      data: {
        reference,
        source: "SITE",
        clientName: nom,
        clientPhone: tel,
        clientAddress: adresse || null,
        clientCompany: entreprise || null,
        message: message || null,
        customerId: customerSession?.sub,
        total,
        status: "NOUVELLE",
        items: { create: items },
        events: {
          create: {
            type: "CREEE",
            toStatus: "NOUVELLE",
            authorName: "Client (site web)",
          },
        },
      },
    });
  });

  after(async () => {
    try {
      await notifyNewOrder({
        clientName: nom,
        clientPhone: tel,
        clientAddress: adresse || null,
        clientCompany: entreprise || null,
        message: message || null,
        total,
      });
    } catch (err) {
      console.error("Échec de la notification de commande :", err);
    }
  });

  return { success: true };
}

// ---------------------------------------------------------------------------
// Suivi des commandes (espace entreprise)
// ---------------------------------------------------------------------------

const NOTE_MAX = 1000;

function readNote(formData: FormData): string {
  return String(formData.get("note") ?? "").trim().slice(0, NOTE_MAX);
}

// Stock : une commande qui devient « Livrée » retire ses quantités du stock (une seule fois).
async function applyDeliveredStock(
  tx: Tx,
  items: Array<{ productId: string | null; quantity: number }>,
  direction: 1 | -1
) {
  for (const it of items) {
    if (!it.productId) continue;
    await tx.product.update({
      where: { id: it.productId },
      data: {
        sold: direction === 1 ? { increment: it.quantity } : { decrement: it.quantity },
        stock: direction === 1 ? { decrement: it.quantity } : { increment: it.quantity },
      },
    });
  }
}

export async function changeOrderStatusAction(
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const session = await requireSession();

  const id = String(formData.get("id") ?? "");
  const to = String(formData.get("to") ?? "");
  const note = readNote(formData);
  if (!id || !isStatus(to)) return { error: "Demande invalide." };

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return { error: "Commande introuvable." };

  if (!canTransition(order.status, to)) {
    return { error: "Ce changement de statut n'est pas autorisé pour cette commande." };
  }
  if (NOTE_REQUIRED_FOR.includes(to) && note.length < 3) {
    return { error: "Merci d'indiquer la raison (observation obligatoire pour une annulation)." };
  }

  const done = await prisma.$transaction(async (tx) => {
    // Garde contre les modifications simultanées : le statut doit être celui que l'on a lu.
    const res = await tx.order.updateMany({
      where: { id, status: order.status },
      data: { status: to, ...(to === "CONFIRMEE" ? { confirmedAt: new Date() } : {}) },
    });
    if (res.count === 0) return false;
    await tx.orderEvent.create({
      data: {
        orderId: id,
        type: EVENT_FOR_STATUS[to],
        fromStatus: order.status,
        toStatus: to,
        note: note || null,
        authorId: session.sub,
        authorName: session.name,
      },
    });
    if (to === "LIVREE") await applyDeliveredStock(tx, order.items, 1);
    return true;
  });

  if (!done) return { error: "La commande a été modifiée entre-temps. Rechargez la page." };

  revalidateOrders(id);
  if (to === "LIVREE") revalidatePath("/produits");
  return { success: true, message: `Statut mis à jour : ${STATUS_LABELS[to]}` };
}

// Réactivation d'une commande terminée ou annulée : administrateur seul, justification obligatoire.
export async function reactivateOrderAction(
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const session = await requireSession();
  if (session.role !== "ADMINISTRATEUR") {
    return { error: "Seul un administrateur peut réactiver une commande terminée ou annulée." };
  }

  const id = String(formData.get("id") ?? "");
  const note = readNote(formData);
  if (!id) return { error: "Demande invalide." };
  if (note.length < 5) return { error: "Une justification est obligatoire pour réactiver une commande." };

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return { error: "Commande introuvable." };
  if (!isTerminal(order.status)) return { error: "Cette commande n'est pas terminée ni annulée." };

  const done = await prisma.$transaction(async (tx) => {
    const res = await tx.order.updateMany({
      where: { id, status: order.status },
      data: { status: REACTIVATION_TARGET },
    });
    if (res.count === 0) return false;
    await tx.orderEvent.create({
      data: {
        orderId: id,
        type: "REACTIVEE",
        fromStatus: order.status,
        toStatus: REACTIVATION_TARGET,
        note,
        authorId: session.sub,
        authorName: session.name,
      },
    });
    // Une commande livrée avait retiré son stock : on le remet pour ne jamais compter deux fois.
    if (order.status === "LIVREE") await applyDeliveredStock(tx, order.items, -1);
    return true;
  });

  if (!done) return { error: "La commande a été modifiée entre-temps. Rechargez la page." };

  revalidateOrders(id);
  revalidatePath("/produits");
  return { success: true };
}

// Modification de la date prévue : justification obligatoire, ancienne date conservée dans l'historique.
export async function updateExpectedDateAction(
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const session = await requireSession();

  const id = String(formData.get("id") ?? "");
  const dateRaw = String(formData.get("date") ?? "").trim();
  const note = readNote(formData);
  const newDate = parseDateInput(dateRaw);
  if (!id || !newDate) return { error: "Merci de choisir une date valide." };

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return { error: "Commande introuvable." };
  if (isTerminal(order.status)) {
    return { error: "La date d'une commande terminée ou annulée ne peut pas être modifiée." };
  }
  if (order.expectedDate && order.expectedDate.getTime() === newDate.getTime()) {
    return { error: "Cette date est déjà celle de la commande." };
  }
  if (order.expectedDate && note.length < 3) {
    return { error: "Merci d'indiquer la raison du changement de date." };
  }

  await prisma.$transaction([
    prisma.order.update({ where: { id }, data: { expectedDate: newDate } }),
    prisma.orderEvent.create({
      data: {
        orderId: id,
        type: "DATE_MODIFIEE",
        oldDate: order.expectedDate,
        newDate,
        note: note || null,
        authorId: session.sub,
        authorName: session.name,
      },
    }),
  ]);

  revalidateOrders(id);
  return { success: true };
}

export async function assignResponsibleAction(
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const session = await requireSession();

  const id = String(formData.get("id") ?? "");
  const responsibleId = String(formData.get("responsibleId") ?? "");
  if (!id) return { error: "Demande invalide." };

  const order = await prisma.order.findUnique({
    where: { id },
    include: { responsible: { select: { name: true } } },
  });
  if (!order) return { error: "Commande introuvable." };
  if (isTerminal(order.status)) {
    return { error: "Une commande terminée ou annulée ne peut plus être réaffectée." };
  }

  let newName = "Aucun";
  if (responsibleId) {
    const user = await prisma.user.findUnique({ where: { id: responsibleId }, select: { name: true } });
    if (!user) return { error: "Employé introuvable." };
    newName = user.name;
  }
  if ((order.responsibleId ?? "") === responsibleId) return { error: "Ce responsable est déjà affecté." };

  await prisma.$transaction([
    prisma.order.update({ where: { id }, data: { responsibleId: responsibleId || null } }),
    prisma.orderEvent.create({
      data: {
        orderId: id,
        type: "RESPONSABLE_MODIFIE",
        note: `${order.responsible?.name ?? "Aucun"} → ${newName}`,
        authorId: session.sub,
        authorName: session.name,
      },
    }),
  ]);

  revalidateOrders(id);
  return { success: true };
}

const manualLinesSchema = z
  .array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive().max(1_000_000) }))
  .min(1);

// Commande enregistrée à la main (ou issue d'un devis converti explicitement) : confirmée dès la saisie.
export async function createManualOrderAction(
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const session = await requireSession();

  const clientName = String(formData.get("clientName") ?? "").trim();
  const clientPhone = String(formData.get("clientPhone") ?? "").trim();
  const clientCompany = String(formData.get("clientCompany") ?? "").trim().slice(0, 150);
  const clientAddress = String(formData.get("clientAddress") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim().slice(0, 2000);
  const dateRaw = String(formData.get("expectedDate") ?? "").trim();
  const responsibleId = String(formData.get("responsibleId") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");
  const linesRaw = String(formData.get("lines") ?? "[]");

  if (!clientName || !clientPhone) {
    return { error: "Veuillez renseigner le nom et le téléphone du client." };
  }
  const expectedDate = dateRaw ? parseDateInput(dateRaw) : null;
  if (dateRaw && !expectedDate) return { error: "Date prévue invalide." };

  let lines: z.infer<typeof manualLinesSchema>;
  try {
    lines = manualLinesSchema.parse(JSON.parse(linesRaw));
  } catch {
    return { error: "Ajoutez au moins un produit avec une quantité valide." };
  }
  const merged = new Map<string, number>();
  for (const l of lines) merged.set(l.productId, (merged.get(l.productId) ?? 0) + l.quantity);

  const products = await prisma.product.findMany({ where: { id: { in: [...merged.keys()] } } });
  if (products.length !== merged.size) return { error: "Un ou plusieurs produits n'existent plus." };

  if (responsibleId) {
    const user = await prisma.user.findUnique({ where: { id: responsibleId }, select: { id: true } });
    if (!user) return { error: "Employé responsable introuvable." };
  }

  if (quoteId) {
    const quote = await prisma.quoteRequest.findUnique({ where: { id: quoteId } });
    if (!quote) return { error: "Demande de devis introuvable." };
    if (quote.convertedOrderId) return { error: "Cette demande de devis a déjà été convertie en commande." };
  }

  const items = products.map((p) => ({
    productId: p.id,
    productName: p.name,
    quantity: merged.get(p.id)!,
    unitPrice: p.price,
  }));
  const total = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const source = quoteId ? "DEVIS" : "MANUELLE";

  const orderId = await prisma.$transaction(async (tx) => {
    const reference = await nextOrderReference(tx);
    const order = await tx.order.create({
      data: {
        reference,
        source,
        clientName,
        clientPhone,
        clientAddress: clientAddress || null,
        clientCompany: clientCompany || null,
        message: message || null,
        total,
        status: "CONFIRMEE",
        confirmedAt: new Date(),
        expectedDate,
        responsibleId: responsibleId || null,
        items: { create: items },
        events: {
          create: [
            {
              type: "CREEE",
              toStatus: "CONFIRMEE",
              note: quoteId ? "Créée depuis une demande de devis" : "Saisie manuelle",
              authorId: session.sub,
              authorName: session.name,
            },
            {
              type: "CONFIRMEE",
              fromStatus: "NOUVELLE",
              toStatus: "CONFIRMEE",
              authorId: session.sub,
              authorName: session.name,
            },
          ],
        },
      },
    });
    if (quoteId) {
      // Garde : une seule conversion possible par demande de devis.
      const res = await tx.quoteRequest.updateMany({
        where: { id: quoteId, convertedOrderId: null },
        data: { convertedOrderId: order.id },
      });
      if (res.count === 0) throw new Error("QUOTE_ALREADY_CONVERTED");
    }
    return order.id;
  });

  revalidateOrders(orderId);
  redirect(`/espace-entreprise/commandes/${orderId}`);
}
