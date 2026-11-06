import Link from "next/link";
import { EVENT_LABELS, STATUS_LABELS, formatDateFr, formatDateTimeFr } from "@/lib/order-workflow";
import type { EventRow } from "@/lib/order-list";

// Pour les autres événements, le libellé suffit (ex. « Commande confirmée »).
const SHOW_TARGET = ["PREPARATION", "EXPEDIEE", "REACTIVEE"];

// Journal des opérations : date, commande, événement, responsable, observations.
export function EventLog({ events }: { events: EventRow[] }) {
  if (events.length === 0) {
    return <p className="mt-3 text-sm text-ink-soft">Aucun événement enregistré pour le moment.</p>;
  }
  return (
    <ul className="mt-3 divide-y divide-border-egbm/60 rounded-lg border border-border-egbm bg-white shadow-sm">
      {events.map((e) => (
        <li key={e.id} className="flex flex-wrap items-start justify-between gap-2 p-3 text-sm">
          <div>
            <div className="font-semibold">
              {EVENT_LABELS[e.type]}
              {e.toStatus && SHOW_TARGET.includes(e.type) && (
                <span className="font-normal text-ink-soft"> → {STATUS_LABELS[e.toStatus]}</span>
              )}
            </div>
            <div className="text-xs text-ink-soft">
              <Link href={`/espace-entreprise/commandes/${e.orderId}`} className="font-mono text-rust hover:underline">
                {e.orderReference ?? "Commande"}
              </Link>{" "}
              · {e.clientName} · par {e.authorName}
            </div>
            {e.type === "DATE_MODIFIEE" && (
              <div className="text-xs text-ink-soft">
                {formatDateFr(e.oldDate)} → {formatDateFr(e.newDate)}
              </div>
            )}
            {e.note && <div className="mt-1 text-xs italic">« {e.note} »</div>}
          </div>
          <div className="text-xs text-ink-soft">{formatDateTimeFr(e.createdAt)}</div>
        </li>
      ))}
    </ul>
  );
}
