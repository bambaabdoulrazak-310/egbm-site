import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { parseDateInput, startOfToday } from "@/lib/order-workflow";
import type { OrderFilters } from "@/lib/order-list";
import type { DeliveryStatusValue } from "@/lib/supplier-workflow";

export interface DeliveryRow {
  id: string;
  orderId: string;
  orderReference: string | null;
  clientName: string;
  lines: Array<{ name: string; quantity: number }>;
  plannedDate: Date | null;
  deliveredAt: Date | null;
  status: DeliveryStatusValue;
  partial: boolean; // livraison effectuée mais commande pas entièrement livrée
  lateDays: number;
  responsibleName: string | null;
  updatedAt: Date;
}

export interface DeliveryStats {
  prevues: number;
  enCours: number;
  partielles: number;
  terminees: number;
  enRetard: number;
}

const OPEN: DeliveryStatusValue[] = ["PREVUE", "EN_COURS"];
const DAY = 24 * 60 * 60 * 1000;

function lateDaysOf(planned: Date | null, status: DeliveryStatusValue, now: Date): number {
  if (!planned || !OPEN.includes(status)) return 0;
  const diff = startOfToday(now).getTime() - planned.getTime();
  return diff > 0 ? Math.floor(diff / DAY) : 0;
}

export async function getDeliveries(f: OrderFilters): Promise<DeliveryRow[]> {
  const now = new Date();
  const and: Prisma.DeliveryWhereInput[] = [];

  if (f.q) {
    const contains = { contains: f.q, mode: "insensitive" as const };
    and.push({
      OR: [
        { order: { is: { reference: contains } } },
        { order: { is: { clientName: contains } } },
        { order: { is: { clientCompany: contains } } },
        { lines: { some: { orderItem: { productName: contains } } } },
        { order: { is: { responsible: { is: { name: contains } } } } },
      ],
    });
  }
  const du = f.du ? parseDateInput(f.du) : null;
  const au = f.au ? parseDateInput(f.au) : null;
  if (du) and.push({ createdAt: { gte: du } });
  if (au) and.push({ createdAt: { lt: new Date(au.getTime() + DAY) } });

  if (f.retard) {
    and.push({ plannedDate: { lt: startOfToday() }, status: { in: OPEN } });
  } else if (f.statut === "PARTIELLE") {
    and.push({ status: "EFFECTUEE", order: { is: { status: { not: "LIVREE" } } } });
  } else if (
    f.statut === "PREVUE" ||
    f.statut === "EN_COURS" ||
    f.statut === "EFFECTUEE" ||
    f.statut === "ANNULEE"
  ) {
    and.push({ status: f.statut });
  } else if (f.statut !== "toutes") {
    and.push({ status: { in: OPEN } });
  }

  const rows = await prisma.delivery.findMany({
    where: { AND: and },
    include: {
      lines: { include: { orderItem: { select: { productName: true } } } },
      order: {
        select: { reference: true, clientName: true, status: true, responsible: { select: { name: true } } },
      },
    },
    orderBy: f.retard ? [{ plannedDate: "asc" }] : [{ createdAt: "desc" }],
    take: 200,
  });

  return rows.map((d) => ({
    id: d.id,
    orderId: d.orderId,
    orderReference: d.order.reference,
    clientName: d.order.clientName,
    lines: d.lines.map((l) => ({ name: l.orderItem.productName, quantity: l.quantity })),
    plannedDate: d.plannedDate,
    deliveredAt: d.deliveredAt,
    status: d.status,
    partial: d.status === "EFFECTUEE" && d.order.status !== "LIVREE",
    lateDays: lateDaysOf(d.plannedDate, d.status, now),
    responsibleName: d.order.responsible?.name ?? null,
    updatedAt: d.updatedAt,
  }));
}

export async function getDeliveryStats(): Promise<DeliveryStats> {
  // Trois requêtes seulement : répartition par statut, livraisons partielles et livraisons en retard.
  const [grouped, partielles, enRetard] = await Promise.all([
    prisma.delivery.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.delivery.count({ where: { status: "EFFECTUEE", order: { is: { status: { not: "LIVREE" } } } } }),
    prisma.delivery.count({ where: { plannedDate: { lt: startOfToday() }, status: { in: OPEN } } }),
  ]);
  const n = (s: DeliveryStatusValue) => grouped.find((g) => g.status === s)?._count._all ?? 0;
  return {
    prevues: n("PREVUE"),
    enCours: n("EN_COURS"),
    partielles,
    terminees: n("EFFECTUEE") - partielles,
    enRetard,
  };
}
