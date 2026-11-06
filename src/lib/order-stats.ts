import "server-only";
import { prisma } from "@/lib/prisma";
import { startOfToday } from "@/lib/order-workflow";

export interface OrderSummary {
  enCours: number; // toutes les commandes non terminées ni annulées
  enAttente: number; // en attente de confirmation
  enPreparation: number; // confirmées ou en préparation
  enLivraison: number;
  enRetard: number;
  terminees: number;
}

// Indicateurs calculés à partir des commandes réelles (page de suivi + route de mise à jour).
export async function getOrderSummary(): Promise<OrderSummary> {
  const today = startOfToday();
  const [grouped, enRetard] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.count({
      where: {
        expectedDate: { lt: today },
        status: { in: ["NOUVELLE", "CONFIRMEE", "EN_COURS", "EN_LIVRAISON"] },
      },
    }),
  ]);

  const n = (...statuses: string[]) =>
    grouped.filter((g) => statuses.includes(g.status)).reduce((s, g) => s + g._count._all, 0);

  return {
    enCours: n("NOUVELLE", "CONFIRMEE", "EN_COURS", "EN_LIVRAISON"),
    enAttente: n("NOUVELLE"),
    enPreparation: n("CONFIRMEE", "EN_COURS"),
    enLivraison: n("EN_LIVRAISON"),
    enRetard,
    terminees: n("LIVREE"),
  };
}
