import type { Metadata } from "next";
import { TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/catalog";

export const metadata: Metadata = { title: "Tableau de bord" };
export const revalidate = 0;

export default async function DashboardPage() {
  const [caResult, commandesEnAttente, stockResult, topProduits] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.count({ where: { status: { in: ["NOUVELLE", "EN_COURS"] } } }),
    prisma.product.aggregate({ _sum: { stock: true } }),
    prisma.product.findMany({ orderBy: { sold: "desc" }, take: 5 }),
  ]);

  const ca = caResult._sum.total ?? 0;
  const stockTotal = stockResult._sum.stock ?? 0;
  const maxSold = topProduits[0]?.sold || 1;

  const stats: Array<[string, string | number]> = [
    ["Chiffre d'affaires (commandes)", formatFCFA(ca)],
    ["Commandes en attente", commandesEnAttente],
    ["Unités en stock", stockTotal],
    ["Produit le plus vendu", topProduits[0]?.name.split(" (")[0] ?? "—"],
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold md:text-4xl">Tableau de bord</h1>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border-egbm bg-cream p-4">
            <div className="text-xs text-ink-soft">{label}</div>
            <div className="mt-1 font-display text-2xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-border-egbm bg-cream p-5">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="text-rust" size={18} />
          <span className="font-display text-xl font-bold">Produits les plus vendus</span>
        </div>
        {topProduits.length === 0 ? (
          <p className="text-sm text-ink-soft">Aucune vente enregistrée pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {topProduits.map((p) => {
              const pct = Math.max(4, Math.round((p.sold / maxSold) * 100));
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-40 shrink-0 truncate text-xs text-ink-soft md:w-56">
                    {p.name.split(" (")[0]}
                  </div>
                  <div className="h-[18px] flex-1 overflow-hidden rounded-full bg-bg-alt">
                    <div className="h-full bg-rust" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-14 shrink-0 text-right font-mono text-xs font-semibold">
                    {p.sold}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
