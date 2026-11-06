import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { formatDateTimeFr } from "@/lib/order-workflow";
import { MOVEMENT_LABELS } from "@/lib/supplier-workflow";

export const metadata: Metadata = { title: "Historique du produit — Espace Entreprise" };
export const revalidate = 0;

export default async function ProductHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { stockMovements: { orderBy: { createdAt: "desc" }, take: 200 } },
  });
  if (!product) notFound();

  return (
    <div>
      <Link
        href="/espace-entreprise/produits"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-rust hover:underline"
      >
        <ArrowLeft size={15} /> Retour aux produits
      </Link>
      <h1 className="mt-3 font-display text-2xl font-extrabold md:text-4xl">{product.name}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Historique du stock : chaque entrée (réception fournisseur) et sortie (livraison client) réellement
        enregistrée.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 md:max-w-md">
        <div className="rounded-lg border border-border-egbm bg-white p-4 shadow-sm">
          <div className="text-xs text-ink-soft">Stock actuel</div>
          <div className="mt-1 font-display text-3xl font-bold">{product.stock}</div>
        </div>
        <div className="rounded-lg border border-border-egbm bg-white p-4 shadow-sm">
          <div className="text-xs text-ink-soft">Vendus (livrés)</div>
          <div className="mt-1 font-display text-3xl font-bold">{product.sold}</div>
        </div>
      </div>

      {product.stockMovements.length === 0 ? (
        <p className="mt-5 rounded-lg border border-border-egbm bg-white p-5 text-sm text-ink-soft">
          Aucun mouvement enregistré pour ce produit. Les livraisons et réceptions effectuées à partir de maintenant
          apparaîtront ici ; le stock antérieur n&apos;a pas d&apos;historique.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-lg border border-border-egbm bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase text-ink-soft">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Opération</th>
                <th className="p-3">Référence</th>
                <th className="p-3 text-right">Quantité</th>
                <th className="p-3">Responsable</th>
                <th className="p-3">Observation</th>
              </tr>
            </thead>
            <tbody>
              {product.stockMovements.map((m) => (
                <tr key={m.id} className="border-t border-border-egbm/60 align-top">
                  <td className="whitespace-nowrap p-3">{formatDateTimeFr(m.createdAt)}</td>
                  <td className="p-3">{MOVEMENT_LABELS[m.type] ?? m.type}</td>
                  <td className="p-3 font-mono">{m.reference ?? "—"}</td>
                  <td
                    className={`p-3 text-right font-mono font-semibold ${m.quantity < 0 ? "text-rust" : "text-green"}`}
                  >
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </td>
                  <td className="p-3">{m.authorName}</td>
                  <td className="p-3 text-xs text-ink-soft">{m.note ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
