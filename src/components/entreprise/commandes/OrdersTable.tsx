import Link from "next/link";
import { formatDateFr, formatDateTimeFr, SOURCE_LABELS } from "@/lib/order-workflow";
import type { OrderRow } from "@/lib/order-list";
import { LateBadge, StatusBadge } from "@/components/entreprise/commandes/OrderBadges";

const MAX_LINES = 3;

function ItemLines({ items, field }: { items: OrderRow["items"]; field: "name" | "quantity" }) {
  const shown = items.slice(0, MAX_LINES);
  return (
    <ul className="space-y-0.5">
      {shown.map((it, i) => (
        <li key={i} className={field === "name" ? "max-w-[220px] truncate" : "font-mono"}>
          {field === "name" ? it.name : it.quantity}
        </li>
      ))}
      {items.length > MAX_LINES && (
        <li className="text-xs text-ink-soft">{field === "name" ? `+ ${items.length - MAX_LINES} autre(s)` : ""}</li>
      )}
    </ul>
  );
}

function href(id: string) {
  return `/espace-entreprise/commandes/${id}`;
}

// Tableau sur ordinateur, cartes sur petits écrans. Chaque ligne ouvre la fiche détaillée.
export function OrdersTable({ rows, empty }: { rows: OrderRow[]; empty: string }) {
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
              <th className="p-3">Client</th>
              <th className="p-3">Produits</th>
              <th className="p-3">Qté</th>
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
                  <Link href={href(o.id)} className="text-rust hover:underline">
                    {o.reference ?? "—"}
                  </Link>
                  <div className="font-sans text-[11px] font-normal text-ink-soft">{SOURCE_LABELS[o.source]}</div>
                </td>
                <td className="p-3">
                  <Link href={href(o.id)} className="font-medium hover:underline">
                    {o.clientName}
                  </Link>
                  {o.clientCompany && <div className="text-xs text-ink-soft">{o.clientCompany}</div>}
                </td>
                <td className="p-3">
                  <ItemLines items={o.items} field="name" />
                </td>
                <td className="p-3">
                  <ItemLines items={o.items} field="quantity" />
                </td>
                <td className="whitespace-nowrap p-3">{formatDateFr(o.createdAt)}</td>
                <td className="p-3">
                  <div className="whitespace-nowrap">{formatDateFr(o.expectedDate)}</div>
                  <LateBadge days={o.lateDays} />
                </td>
                <td className="p-3">
                  <StatusBadge status={o.status} />
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
          <Link
            key={o.id}
            href={href(o.id)}
            className="rounded-lg border border-border-egbm bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-mono text-sm font-semibold text-rust">{o.reference ?? "—"}</div>
                <div className="font-semibold">{o.clientName}</div>
                {o.clientCompany && <div className="text-xs text-ink-soft">{o.clientCompany}</div>}
              </div>
              <StatusBadge status={o.status} />
            </div>
            <ul className="mt-2 text-sm text-ink-soft">
              {o.items.slice(0, MAX_LINES).map((it, i) => (
                <li key={i}>
                  {it.quantity} × {it.name}
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
