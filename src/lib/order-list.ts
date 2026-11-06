import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  daysLate,
  isStatus,
  parseDateInput,
  startOfToday,
  type OrderEventTypeValue,
  type OrderSourceValue,
  type OrderStatusValue,
} from "@/lib/order-workflow";

export interface OrderFilters {
  q: string;
  statut: string; // "actives" (défaut) | "toutes" | un statut
  type: string; // "" | SITE | MANUELLE | DEVIS
  retard: boolean;
  du: string;
  au: string;
}

export interface OrderRow {
  id: string;
  reference: string | null;
  clientName: string;
  clientCompany: string | null;
  source: OrderSourceValue;
  items: Array<{ name: string; quantity: number }>;
  createdAt: Date;
  expectedDate: Date | null;
  status: OrderStatusValue;
  responsibleName: string | null;
  updatedAt: Date;
  lateDays: number;
}

export interface EventRow {
  id: string;
  type: OrderEventTypeValue;
  fromStatus: OrderStatusValue | null;
  toStatus: OrderStatusValue | null;
  note: string | null;
  authorName: string;
  createdAt: Date;
  oldDate: Date | null;
  newDate: Date | null;
  orderId: string;
  orderReference: string | null;
  clientName: string;
}

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function parseFilters(params: SearchParams): OrderFilters {
  return {
    q: one(params.q).slice(0, 100),
    statut: one(params.statut) || "actives",
    type: one(params.type),
    retard: one(params.retard) === "1",
    du: one(params.du),
    au: one(params.au),
  };
}

const ACTIVE: OrderStatusValue[] = ["CONFIRMEE", "EN_COURS", "EN_LIVRAISON"];
const NOT_TERMINAL: OrderStatusValue[] = ["NOUVELLE", "CONFIRMEE", "EN_COURS", "EN_LIVRAISON"];
const TERMINAL: OrderStatusValue[] = ["LIVREE", "ANNULEE"];

// Filtres communs (recherche, type, période) — le statut est ajouté par chaque onglet.
function baseWhere(f: OrderFilters): Prisma.OrderWhereInput {
  const and: Prisma.OrderWhereInput[] = [];

  if (f.q) {
    const contains = { contains: f.q, mode: "insensitive" as const };
    and.push({
      OR: [
        { reference: contains },
        { clientName: contains },
        { clientCompany: contains },
        { clientPhone: contains },
        { items: { some: { productName: contains } } },
        { responsible: { is: { name: contains } } },
      ],
    });
  }
  if (f.type === "SITE" || f.type === "MANUELLE" || f.type === "DEVIS") {
    and.push({ source: f.type });
  }
  const du = f.du ? parseDateInput(f.du) : null;
  const au = f.au ? parseDateInput(f.au) : null;
  if (du) and.push({ createdAt: { gte: du } });
  if (au) and.push({ createdAt: { lt: new Date(au.getTime() + 24 * 60 * 60 * 1000) } });

  return and.length ? { AND: and } : {};
}

function statusWhere(f: OrderFilters, defaults: OrderStatusValue[]): Prisma.OrderWhereInput {
  const and: Prisma.OrderWhereInput[] = [];
  if (f.retard) {
    and.push({ expectedDate: { lt: startOfToday() } });
  }
  if (f.statut !== "toutes" && f.statut !== "actives" && isStatus(f.statut)) {
    and.push({ status: f.statut });
  } else if (f.statut === "toutes") {
    // aucune restriction de statut
  } else {
    and.push({ status: { in: f.retard ? NOT_TERMINAL : defaults } });
  }
  // Une commande en retard est forcément non terminée.
  if (f.retard) and.push({ status: { in: NOT_TERMINAL } });
  return and.length ? { AND: and } : {};
}

const orderInclude = {
  items: { select: { productName: true, quantity: true } },
  responsible: { select: { name: true } },
} satisfies Prisma.OrderInclude;

type OrderWithRels = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

function toRow(o: OrderWithRels, now: Date): OrderRow {
  return {
    id: o.id,
    reference: o.reference,
    clientName: o.clientName,
    clientCompany: o.clientCompany,
    source: o.source,
    items: o.items.map((it) => ({ name: it.productName, quantity: it.quantity })),
    createdAt: o.createdAt,
    expectedDate: o.expectedDate,
    status: o.status,
    responsibleName: o.responsible?.name ?? null,
    updatedAt: o.updatedAt,
    lateDays: daysLate(o.expectedDate, o.status, now),
  };
}

const LIMIT = 200;

// Onglet « Commandes clients » : commandes confirmées en cours (+ filtres), hors demandes à confirmer.
export async function getClientOrders(f: OrderFilters): Promise<OrderRow[]> {
  const now = new Date();
  const rows = await prisma.order.findMany({
    where: { AND: [baseWhere(f), statusWhere(f, ACTIVE)] },
    include: orderInclude,
    orderBy: f.retard ? [{ expectedDate: "asc" }] : [{ createdAt: "desc" }],
    take: LIMIT,
  });
  return rows.map((o) => toRow(o, now));
}

// Demandes du site en attente de confirmation (pas encore des commandes confirmées).
export async function getOrdersToConfirm(f: OrderFilters): Promise<OrderRow[]> {
  const now = new Date();
  const rows = await prisma.order.findMany({
    where: { AND: [baseWhere(f), { status: "NOUVELLE" }] },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
    take: LIMIT,
  });
  return rows.map((o) => toRow(o, now));
}

// Onglet « Historique » : commandes terminées ou annulées + journal des événements.
export async function getHistory(f: OrderFilters): Promise<{ orders: OrderRow[]; events: EventRow[] }> {
  const now = new Date();
  const where = baseWhere(f);
  const statusFilter: Prisma.OrderWhereInput =
    f.statut === "LIVREE" || f.statut === "ANNULEE"
      ? { status: f.statut }
      : { status: { in: TERMINAL } };

  const [orders, events] = await Promise.all([
    prisma.order.findMany({
      where: { AND: [where, statusFilter] },
      include: orderInclude,
      orderBy: { updatedAt: "desc" },
      take: LIMIT,
    }),
    prisma.orderEvent.findMany({
      where: { order: { is: where } },
      include: { order: { select: { reference: true, clientName: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return {
    orders: orders.map((o) => toRow(o, now)),
    events: events.map((e) => ({
      id: e.id,
      type: e.type,
      fromStatus: e.fromStatus,
      toStatus: e.toStatus,
      note: e.note,
      authorName: e.authorName,
      createdAt: e.createdAt,
      oldDate: e.oldDate,
      newDate: e.newDate,
      orderId: e.orderId,
      orderReference: e.order.reference,
      clientName: e.order.clientName,
    })),
  };
}
