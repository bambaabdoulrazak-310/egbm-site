import Link from "next/link";
import { formatDateFr, formatDateTimeFr } from "@/lib/order-workflow";
import {
  DELIVERY_CLASSES,
  DELIVERY_LABELS,
  SUPPLIER_CLASSES,
  SUPPLIER_LABELS,
  type SupplierStatusValue,
} from "@/lib/supplier-workflow";
import type { SupplierRow } from "@/lib/supplier-list";
import type { DeliveryRow } from "@/lib/delivery-list";
import { LateBadge } from "@/components/entreprise/commandes/OrderBadges";

const MAX_LINES = 3;

function SupplierBadge({ status }: { status: SupplierStatusValue }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${SUPPLIER_CLASSES[status]}`}
    >
      {SUPPLIER_LABELS[status]}
    </span>
  );
}

const supplierHref = (id: string) => `/espace-entreprise/commandes/fournisseurs/${id}`;

// Compteurs affichés en haut d'un onglet (valeurs réelles calculées côté serveur).
export function StatCards({
  items,
}: {
  items: Array<{ label: string; value: number; href?: string; alert?: boolean }>;
}) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {items.map((s) => {
        const alert = s.alert && s.value > 0;
        const body = (
          <>
            <div className="text-xs text-ink-soft">{s.label}</div>
            <div className={`mt-1 font-display text-2xl font-bold ${alert ? "text-rust" : ""}`}>{s.value}</div>
          </>
        );
        const cls = `rounded-lg border bg-white p-3 shadow-sm ${alert ? "border-rust" : "border-border-egbm"}`;
        return s.href ? (
          <Link key={s.label} href={s.href} className={`${cls} transition-colors hover:border-rust`}>
            {body}
          </Link>
        ) : (
          <div key={s.label} className={cls}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

export function SupplierOrdersTable({ rows, empty }: { rows: SupplierRow[]; empty: string }) {
  if (rows.length === 0) {
    return <p className="mt-4 rounded-lg border border-border-egbm bg-white p-5 text-sm text-ink-soft">{empty}</p>;
  }
  return (
    <>
      <div className="mt-4 hidden overflow-x-auto rounded-lg border border-border-egbm bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-ink-soft">
            <tr>
              <th className="p-3">N° commande</th>
              <th className="p-3">Fournisseur</th>
              <th className="p-3">Produits</th>
              <th className="p-3">Qté (reçue / commandée)</th>
              <th className="p-3">Créée le</th>
              <th className="p-3">Date prévue</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Responsable</th>
              <th className="p-3">Dernière mise à jour</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-border-egbm/60 align-top hover:bg-cream/50">
                <td className="p-3 font-mono font-semibold">
                  <Link href={supplierHref(o.id)} className="text-rust hover:underline">
                    {o.reference}
                  </Link>
                </td>
                <td className="p-3">
                  <Link href={supplierHref(o.id)} className="font-medium hover:underline">
                    {o.supplierName}
                  </Link>
                </td>
                <td className="p-3">
                  <ul className="space-y-0.5">
                    {o.items.slice(0, MAX_LINES).map((it, i) => (
                      <li key={i} className="max-w-[220px] truncate">
                        {it.name}
                      </li>
                    ))}
                    {o.items.length > MAX_LINES && (
                      <li className="text-xs text-ink-soft">+ {o.items.length - MAX_LINES} autre(s)</li>
                    )}
                  </ul>
                </td>
                <td className="p-3">
                  <ul className="space-y-0.5 font-mono">
                    {o.items.slice(0, MAX_LINES).map((it, i) => (
                      <li key={i}>
                        {it.receivedQty} / {it.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="whitespace-nowrap p-3">{formatDateFr(o.createdAt)}</td>
                <td className="p-3">
                  <div className="whitespace-nowrap">{formatDateFr(o.expectedDate)}</div>
                  <LateBadge days={o.lateDays} />
                </td>
                <td className="p-3">
                  <SupplierBadge status={o.status} />
                </td>
                <td className="p-3">{o.responsibleName ?? <span className="text-ink-soft">—</span>}</td>
                <td className="whitespace-nowrap p-3 text-xs text-ink-soft">{formatDateTimeFr(o.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:hidden">
        {rows.map((o) => (
          <Link key={o.id} href={supplierHref(o.id)} className="rounded-lg border border-border-egbm bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-mono text-sm font-semibold text-rust">{o.reference}</div>
                <div className="font-semibold">{o.supplierName}</div>
              </div>
              <SupplierBadge status={o.status} />
            </div>
            <ul className="mt-2 text-sm text-ink-soft">
              {o.items.slice(0, MAX_LINES).map((it, i) => (
                <li key={i}>
                  {it.receivedQty} / {it.quantity} × {it.name}
                </li>
              ))}
              {o.items.length > MAX_LINES && <li>+ {o.items.length - MAX_LINES} autre(s)</li>}
            </ul>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
              <span>Créée le {formatDateFr(o.createdAt)}</span>
              <span>Prévue : {formatDateFr(o.expectedDate)}</span>
              <span>Resp. : {o.responsibleName ?? "—"}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
              <LateBadge days={o.lateDays} />
              <span className="text-[11px] text-ink-soft">MàJ {formatDateTimeFr(o.updatedAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

function DeliveryBadge({ row }: { row: DeliveryRow }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span
        className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${DELIVERY_CLASSES[row.status]}`}
      >
        {DELIVERY_LABELS[row.status]}
      </span>
      {row.partial && (
        <span className="inline-block whitespace-nowrap rounded-full bg-rust/15 px-2.5 py-0.5 text-xs font-bold text-rust-dark">
          Partielle
        </span>
      )}
    </span>
  );
}

const orderHref = (id: string) => `/espace-entreprise/commandes/${id}`;

export function DeliveriesTable({ rows, empty }: { rows: DeliveryRow[]; empty: string }) {
  if (rows.length === 0) {
    return <p className="mt-4 rounded-lg border border-border-egbm bg-white p-5 text-sm text-ink-soft">{empty}</p>;
  }
  return (
    <>
      <div className="mt-4 hidden overflow-x-auto rounded-lg border border-border-egbm bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-ink-soft">
            <tr>
              <th className="p-3">Commande</th>
              <th className="p-3">Client</th>
              <th className="p-3">Produits livrés</th>
              <th className="p-3">Date prévue</th>
              <th className="p-3">Livrée le</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Responsable</th>
              <th className="p-3">Dernière mise à jour</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id} className="border-t border-border-egbm/60 align-top hover:bg-cream/50">
                <td className="p-3 font-mono font-semibold">
                  <Link href={orderHref(d.orderId)} className="text-rust hover:underline">
                    {d.orderReference ?? "—"}
                  </Link>
                </td>
                <td className="p-3">
                  <Link href={orderHref(d.orderId)} className="font-medium hover:underline">
                    {d.clientName}
                  </Link>
                </td>
                <td className="p-3">
                  <ul className="space-y-0.5">
                    {d.lines.slice(0, MAX_LINES).map((l, i) => (
                      <li key={i} className="max-w-[260px] truncate">
                        {l.quantity} × {l.name}
                      </li>
                    ))}
                    {d.lines.length > MAX_LINES && (
                      <li className="text-xs text-ink-soft">+ {d.lines.length - MAX_LINES} autre(s)</li>
                    )}
                  </ul>
                </td>
                <td className="p-3">
                  <div className="whitespace-nowrap">{formatDateFr(d.plannedDate)}</div>
                  <LateBadge days={d.lateDays} />
                </td>
                <td className="whitespace-nowrap p-3">{formatDateFr(d.deliveredAt)}</td>
                <td className="p-3">
                  <DeliveryBadge row={d} />
                </td>
                <td className="p-3">{d.responsibleName ?? <span className="text-ink-soft">—</span>}</td>
                <td className="whitespace-nowrap p-3 text-xs text-ink-soft">{formatDateTimeFr(d.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:hidden">
        {rows.map((d) => (
          <Link key={d.id} href={orderHref(d.orderId)} className="rounded-lg border border-border-egbm bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-mono text-sm font-semibold text-rust">{d.orderReference ?? "—"}</div>
                <div className="font-semibold">{d.clientName}</div>
              </div>
              <DeliveryBadge row={d} />
            </div>
            <ul className="mt-2 text-sm text-ink-soft">
              {d.lines.slice(0, MAX_LINES).map((l, i) => (
                <li key={i}>
                  {l.quantity} × {l.name}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
              <span>Prévue : {formatDateFr(d.plannedDate)}</span>
              {d.deliveredAt && <span>Livrée le {formatDateFr(d.deliveredAt)}</span>}
              <span>Resp. : {d.responsibleName ?? "—"}</span>
            </div>
            <div className="mt-1.5">
              <LateBadge days={d.lateDays} />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
