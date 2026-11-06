import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { daysLate, parseDateInput, startOfToday } from "@/lib/order-workflow";
import { isSupplierStatus, type SupplierStatusValue } from "@/lib/supplier-workflow";
import type { OrderFilters } from "@/lib/order-list";

export interface SupplierRow {
  id: string;
  reference: string;
  supplierName: string;
  items: Array<{ name: string; quantity: number; receivedQty: number }>;
  createdAt: Date;
  expectedDate: Date | null;
  status: SupplierStatusValue;
  responsibleName: string | null;
  updatedAt: Date;
  lateDays: number;
}

export interface SupplierStats {
  enCours: number;
  aEnvoyer: number; // brouillons
  attenteReception: number; // envoyées, confirmées ou expédiées
  partielles: number;
  enRetard: number;
  recues: number;
}

const OPEN: SupplierStatusValue[] = ["BROUILLON", "ENVOYEE", "CONFIRMEE", "EXPEDIEE", "RECUE_PARTIELLEMENT"];
const TERMINAL: SupplierStatusValue[] = ["RECUE", "ANNULEE"];

export function supplierBaseWhere(f: OrderFilters): Prisma.SupplierOrderWhereInput {
  const and: Prisma.SupplierOrderWhereInput[] = [];
  if (f.q) {
    const contains = { contains: f.q, mode: "insensitive" as const };
    and.push({
      OR: [
        { reference: contains },
        { supplierName: contains },
        { supplierContact: contains },
        { items: { some: { productName: contains } } },
        { responsible: { is: { name: contains } } },
      ],
    });
  }
  const du = f.du ? parseDateInput(f.du) : null;
  const au = f.au ? parseDateInput(f.au) : null;
  if (du) and.push({ createdAt: { gte: du } });
  if (au) and.push({ createdAt: { lt: new Date(au.getTime() + 24 * 60 * 60 * 1000) } });
  return and.length ? { AND: and } : {};
}

const include = {
  items: { select: { productName: true, quantity: true, receivedQty: true } },
  responsible: { select: { name: true } },
} satisfies Prisma.SupplierOrderInclude;

type WithRels = Prisma.SupplierOrderGetPayload<{ include: typeof include }>;

function toRow(o: WithRels, now: Date): SupplierRow {
  return {
    id: o.id,
    reference: o.reference,
    supplierName: o.supplierName,
    items: o.items.map((i) => ({ name: i.productName, quantity: i.quantity, receivedQty: i.receivedQty })),
    createdAt: o.createdAt,
    expectedDate: o.expectedDate,
    status: o.status,
    responsibleName: o.responsible?.name ?? null,
    updatedAt: o.updatedAt,
    // Les commandes reçues ou annulées ne sont jamais en retard.
    lateDays: daysLate(o.expectedDate, TERMINAL.includes(o.status) ? "LIVREE" : "EN_COURS", now),
  };
}

export async function getSupplierOrders(f: OrderFilters): Promise<SupplierRow[]> {
  const now = new Date();
  const and: Prisma.SupplierOrderWhereInput[] = [supplierBaseWhere(f)];
  if (f.retard) and.push({ expectedDate: { lt: startOfToday() } });
  if (f.statut !== "toutes" && f.statut !== "actives" && isSupplierStatus(f.statut)) {
    and.push({ status: f.statut });
  } else if (f.statut !== "toutes") {
    and.push({ status: { in: OPEN } });
  }
  if (f.retard) and.push({ status: { in: OPEN } });

  const rows = await prisma.supplierOrder.findMany({
    where: { AND: and },
    include,
    orderBy: f.retard ? [{ expectedDate: "asc" }] : [{ createdAt: "desc" }],
    take: 200,
  });
  return rows.map((o) => toRow(o, now));
}

export async function getSupplierHistory(f: OrderFilters): Promise<SupplierRow[]> {
  const now = new Date();
  const status: Prisma.SupplierOrderWhereInput =
    f.statut === "RECUE" || f.statut === "ANNULEE" ? { status: f.statut } : { status: { in: TERMINAL } };
  const rows = await prisma.supplierOrder.findMany({
    where: { AND: [supplierBaseWhere(f), status] },
    include,
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return rows.map((o) => toRow(o, now));
}

export async function getSupplierStats(): Promise<SupplierStats> {
  const [grouped, enRetard] = await Promise.all([
    prisma.supplierOrder.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.supplierOrder.count({ where: { expectedDate: { lt: startOfToday() }, status: { in: OPEN } } }),
  ]);
  const n = (...s: SupplierStatusValue[]) =>
    grouped.filter((g) => s.includes(g.status)).reduce((sum, g) => sum + g._count._all, 0);
  return {
    enCours: n(...OPEN),
    aEnvoyer: n("BROUILLON"),
    attenteReception: n("ENVOYEE", "CONFIRMEE", "EXPEDIEE"),
    partielles: n("RECUE_PARTIELLEMENT"),
    enRetard,
    recues: n("RECUE"),
  };
}
