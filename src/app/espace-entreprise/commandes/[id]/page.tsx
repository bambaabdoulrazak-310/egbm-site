import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { formatFCFA } from "@/lib/catalog";
import {
  EVENT_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
  daysLate,
  formatDateFr,
  formatDateTimeFr,
  isTerminal,
} from "@/lib/order-workflow";
import { LateBadge, StatusBadge } from "@/components/entreprise/commandes/OrderBadges";
import {
  DatePanel,
  ReactivatePanel,
  ResponsiblePanel,
  StatusPanel,
} from "@/components/entreprise/commandes/OrderActions";

export const metadata: Metadata = { title: "Fiche commande — Espace Entreprise" };
export const revalidate = 0;

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;

  const [order, users] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        responsible: { select: { id: true, name: true } },
        events: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!order) notFound();

  const closed = isTerminal(order.status);
  const lateDays = daysLate(order.expectedDate, order.status);
  const hasCreationEvent = order.events.some((e) => e.type === "CREEE");
  const hasStatusEvent = order.events.some((e) => e.toStatus && e.type !== "CREEE");
  const legacyGap = order.status !== "NOUVELLE" && !hasStatusEvent;

  return (
    <div>
      <Link
        href="/espace-entreprise/commandes"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-rust hover:underline"
      >
        <ArrowLeft size={15} /> Retour au suivi
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-extrabold md:text-4xl">
          Commande <span className="font-mono">{order.reference ?? "—"}</span>
        </h1>
        <StatusBadge status={order.status} />
        <LateBadge days={lateDays} />
      </div>
      <p className="mt-1 text-sm text-ink-soft">{SOURCE_LABELS[order.source]}</p>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <section className="rounded-lg border border-border-egbm bg-white p-4 shadow-sm">
            <h2 className="font-display text-lg font-bold">Client</h2>
            <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-ink-soft">Nom</dt>
                <dd className="font-semibold">{order.clientName}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">Entreprise</dt>
                <dd>{order.clientCompany ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">Téléphone</dt>
                <dd>{order.clientPhone}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">Adresse de livraison</dt>
                <dd>{order.clientAddress ?? "—"}</dd>
              </div>
            </dl>
            {order.message && (
              <div className="mt-3 whitespace-pre-line rounded-md bg-cream p-3 text-sm">
                <span className="font-semibold">Message du client : </span>
                {order.message}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-border-egbm bg-white p-4 shadow-sm">
            <h2 className="font-display text-lg font-bold">Produits</h2>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-ink-soft">
                  <tr>
                    <th className="py-1.5 pr-3">Produit</th>
                    <th className="py-1.5 pr-3">Quantité</th>
                    <th className="py-1.5 pr-3 text-right">Prix unitaire</th>
                    <th className="py-1.5 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it) => (
                    <tr key={it.id} className="border-t border-border-egbm/60">
                      <td className="py-1.5 pr-3">{it.productName}</td>
                      <td className="py-1.5 pr-3 font-mono">{it.quantity}</td>
                      <td className="py-1.5 pr-3 text-right font-mono">{formatFCFA(it.unitPrice)}</td>
                      <td className="py-1.5 text-right font-mono">{formatFCFA(it.unitPrice * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border-egbm font-semibold">
                    <td colSpan={3} className="py-2 pr-3 text-right">
                      Total
                    </td>
                    <td className="py-2 text-right font-mono">{formatFCFA(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-border-egbm bg-white p-4 shadow-sm">
            <h2 className="font-display text-lg font-bold">Chronologie</h2>
            <ol className="mt-3 space-y-4 border-l-2 border-border-egbm pl-5">
              {!hasCreationEvent && (
                <li className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-rust" />
                  <div className="font-semibold">{EVENT_LABELS.CREEE}</div>
                  <div className="text-xs text-ink-soft">
                    {formatDateTimeFr(order.createdAt)} · {order.source === "SITE" ? "Client (site web)" : "—"}
                  </div>
                </li>
              )}
              {order.events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-rust" />
                  <div className="font-semibold">
                    {EVENT_LABELS[e.type]}
                    {e.toStatus && ["PREPARATION", "EXPEDIEE", "REACTIVEE"].includes(e.type) && (
                      <span className="font-normal text-ink-soft"> → {STATUS_LABELS[e.toStatus]}</span>
                    )}
                  </div>
                  <div className="text-xs text-ink-soft">
                    {formatDateTimeFr(e.createdAt)} · {e.authorName}
                  </div>
                  {e.type === "DATE_MODIFIEE" && (
                    <div className="text-xs text-ink-soft">
                      Ancienne date : {formatDateFr(e.oldDate)} → nouvelle date : {formatDateFr(e.newDate)}
                    </div>
                  )}
                  {e.note && <div className="mt-1 text-sm italic">« {e.note} »</div>}
                </li>
              ))}
            </ol>
            {legacyGap && (
              <p className="mt-4 rounded-md bg-surface p-3 text-xs text-ink-soft">
                Statut actuel : <strong>{STATUS_LABELS[order.status]}</strong> (dernière mise à jour le{" "}
                {formatDateTimeFr(order.updatedAt)}). Les changements de statut antérieurs au suivi n&apos;ont
                pas été enregistrés.
              </p>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <section className="rounded-lg border border-border-egbm bg-white p-4 shadow-sm">
            <h2 className="font-display text-lg font-bold">Suivi</h2>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Créée le</dt>
                <dd>{formatDateFr(order.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Confirmée le</dt>
                <dd>{formatDateFr(order.confirmedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Date prévue</dt>
                <dd>{formatDateFr(order.expectedDate)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Responsable</dt>
                <dd>{order.responsible?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Dernière mise à jour</dt>
                <dd>{formatDateTimeFr(order.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          {closed ? (
            <ReactivatePanel orderId={order.id} isAdmin={session.role === "ADMINISTRATEUR"} />
          ) : (
            <>
              <StatusPanel orderId={order.id} status={order.status} />
              <DatePanel orderId={order.id} expectedDate={order.expectedDate} />
              <ResponsiblePanel
                orderId={order.id}
                responsibleId={order.responsible?.id ?? null}
                users={users}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
