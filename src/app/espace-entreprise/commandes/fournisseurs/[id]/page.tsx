import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import {
  EVENT_LABELS,
  daysLate,
  eventLabel,
  formatDateFr,
  formatDateTimeFr,
} from "@/lib/order-workflow";
import {
  SUPPLIER_CLASSES,
  SUPPLIER_LABELS,
  isSupplierTerminal,
} from "@/lib/supplier-workflow";
import { LateBadge } from "@/components/entreprise/commandes/OrderBadges";
import {
  DatePanel,
  ReactivatePanel,
  ResponsiblePanel,
} from "@/components/entreprise/commandes/OrderActions";
import { ReceivePanel, SupplierStatusPanel } from "@/components/entreprise/commandes/SupplierActions";
import {
  assignSupplierResponsibleAction,
  reactivateSupplierOrderAction,
  updateSupplierDateAction,
} from "@/lib/actions/supplier-orders";

export const metadata: Metadata = { title: "Fiche commande fournisseur — Espace Entreprise" };
export const revalidate = 0;

export default async function SupplierOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;

  const [order, users] = await Promise.all([
    prisma.supplierOrder.findUnique({
      where: { id },
      include: {
        items: true,
        responsible: { select: { id: true, name: true } },
        events: { orderBy: { createdAt: "asc" } },
        receipts: { orderBy: { receivedAt: "asc" }, include: { lines: { include: { item: true } } } },
      },
    }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!order) notFound();

  const closed = isSupplierTerminal(order.status);
  const lateDays = closed ? 0 : daysLate(order.expectedDate, "EN_COURS");
  const hasCreation = order.events.some((e) => e.type === "CREEE");

  return (
    <div>
      <Link
        href="/espace-entreprise/commandes?onglet=fournisseurs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-rust hover:underline"
      >
        <ArrowLeft size={15} /> Retour aux commandes fournisseurs
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-extrabold md:text-4xl">
          Commande fournisseur <span className="font-mono">{order.reference}</span>
        </h1>
        <span
          className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${SUPPLIER_CLASSES[order.status]}`}
        >
          {SUPPLIER_LABELS[order.status]}
        </span>
        <LateBadge days={lateDays} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <section className="rounded-lg border border-border-egbm bg-white p-4 shadow-sm">
            <h2 className="font-display text-lg font-bold">Fournisseur</h2>
            <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-ink-soft">Nom</dt>
                <dd className="font-semibold">{order.supplierName}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">Contact</dt>
                <dd>{order.supplierContact ?? "—"}</dd>
              </div>
            </dl>
            {order.notes && (
              <div className="mt-3 whitespace-pre-line rounded-md bg-cream p-3 text-sm">
                <span className="font-semibold">Observations : </span>
                {order.notes}
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
                    <th className="py-1.5 pr-3">Commandé</th>
                    <th className="py-1.5 pr-3">Reçu</th>
                    <th className="py-1.5">Reste</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it) => (
                    <tr key={it.id} className="border-t border-border-egbm/60">
                      <td className="py-1.5 pr-3">{it.productName}</td>
                      <td className="py-1.5 pr-3 font-mono">{it.quantity}</td>
                      <td className="py-1.5 pr-3 font-mono">{it.receivedQty}</td>
                      <td className="py-1.5 font-mono">{Math.max(it.quantity - it.receivedQty, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {order.receipts.length > 0 && (
            <section className="rounded-lg border border-border-egbm bg-white p-4 shadow-sm">
              <h2 className="font-display text-lg font-bold">Réceptions enregistrées</h2>
              <ul className="mt-2 flex flex-col gap-2 text-sm">
                {order.receipts.map((r) => (
                  <li key={r.id} className="rounded-md border border-border-egbm/70 p-3">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="font-semibold">{formatDateTimeFr(r.receivedAt)}</span>
                      <span className="text-xs text-ink-soft">par {r.authorName}</span>
                    </div>
                    <div className="text-ink-soft">
                      {r.lines.map((l) => `${l.quantity} × ${l.item.productName}`).join(" · ")}
                    </div>
                    {r.note && <div className="mt-1 text-xs italic">« {r.note} »</div>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-lg border border-border-egbm bg-white p-4 shadow-sm">
            <h2 className="font-display text-lg font-bold">Chronologie</h2>
            <ol className="mt-3 space-y-4 border-l-2 border-border-egbm pl-5">
              {!hasCreation && (
                <li className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-rust" />
                  <div className="font-semibold">{EVENT_LABELS.CREEE}</div>
                  <div className="text-xs text-ink-soft">{formatDateTimeFr(order.createdAt)}</div>
                </li>
              )}
              {order.events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-rust" />
                  <div className="font-semibold">{eventLabel(e.type, null, null, e.detail)}</div>
                  <div className="text-xs text-ink-soft">
                    {formatDateTimeFr(e.createdAt)} · {e.authorName}
                  </div>
                  {e.detail && !e.detail.startsWith("Retour") && (
                    <div className="text-xs text-ink-soft">{e.detail}</div>
                  )}
                  {e.type === "DATE_MODIFIEE" && (
                    <div className="text-xs text-ink-soft">
                      Ancienne date : {formatDateFr(e.oldDate)} → nouvelle date : {formatDateFr(e.newDate)}
                    </div>
                  )}
                  {e.note && <div className="mt-1 text-sm italic">« {e.note} »</div>}
                </li>
              ))}
            </ol>
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
            order.status === "ANNULEE" ? (
              <ReactivatePanel
                orderId={order.id}
                isAdmin={session.role === "ADMINISTRATEUR"}
                action={reactivateSupplierOrderAction}
                target="Brouillon"
              />
            ) : (
              <div className="rounded-lg border border-border-egbm bg-white p-4 text-sm text-ink-soft shadow-sm">
                Cette commande est entièrement reçue : elle est définitive.
              </div>
            )
          ) : (
            <>
              <SupplierStatusPanel orderId={order.id} status={order.status} />
              {order.status !== "BROUILLON" && (
                <ReceivePanel
                  orderId={order.id}
                  items={order.items.map((i) => ({
                    id: i.id,
                    name: i.productName,
                    quantity: i.quantity,
                    receivedQty: i.receivedQty,
                  }))}
                />
              )}
              <DatePanel orderId={order.id} expectedDate={order.expectedDate} action={updateSupplierDateAction} />
              <ResponsiblePanel
                orderId={order.id}
                responsibleId={order.responsible?.id ?? null}
                users={users}
                action={assignSupplierResponsibleAction}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
