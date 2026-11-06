"use client";

import { useActionState, useState, useTransition } from "react";
import {
  cancelDeliveryAction,
  completeDeliveryAction,
  planDeliveryAction,
  rescheduleDeliveryAction,
  startDeliveryAction,
  type DeliveryActionState,
} from "@/lib/actions/deliveries";
import { formatDateFr, formatDateTimeFr, toDateInput } from "@/lib/order-workflow";
import { DELIVERY_CLASSES, DELIVERY_LABELS, type DeliveryStatusValue } from "@/lib/supplier-workflow";
import { Feedback, field, panel } from "@/components/entreprise/commandes/OrderActions";

export interface DeliveryItemInfo {
  id: string;
  name: string;
  ordered: number;
  delivered: number;
  planned: number;
}

export interface DeliveryInfo {
  id: string;
  status: DeliveryStatusValue;
  plannedDate: Date | null;
  deliveredAt: Date | null;
  note: string | null;
  authorName: string;
  createdAt: Date;
  lines: Array<{ name: string; quantity: number }>;
}

const initial: DeliveryActionState = {};

// Bouton simple (un seul identifiant caché) pour expédier ou valider une livraison.
function ActionButton({
  action,
  deliveryId,
  label,
  primary,
}: {
  action: (prev: DeliveryActionState, formData: FormData) => Promise<DeliveryActionState>;
  deliveryId: string;
  label: string;
  primary?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="deliveryId" value={deliveryId} />
      <button
        type="submit"
        disabled={pending}
        className={`rounded-md px-3 py-1.5 text-sm font-semibold disabled:opacity-50 ${
          primary ? "bg-rust text-white" : "border border-border-egbm"
        }`}
      >
        {label}
      </button>
      <Feedback state={state} />
    </form>
  );
}

function RescheduleForm({ deliveryId, plannedDate }: { deliveryId: string; plannedDate: Date | null }) {
  const [state, formAction, pending] = useActionState(rescheduleDeliveryAction, initial);
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="deliveryId" value={deliveryId} />
      <input type="date" name="date" required defaultValue={toDateInput(plannedDate)} className={field} />
      <input
        name="note"
        required={plannedDate !== null}
        maxLength={1000}
        placeholder={plannedDate ? "Raison du report (obligatoire)" : "Observation (facultatif)"}
        className={field}
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md border border-border-egbm px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
      >
        Enregistrer la date
      </button>
      <Feedback state={state} />
    </form>
  );
}

function CancelForm({ deliveryId }: { deliveryId: string }) {
  const [state, formAction, pending] = useActionState(cancelDeliveryAction, initial);
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="deliveryId" value={deliveryId} />
      <input name="note" required maxLength={1000} placeholder="Raison de l'annulation (obligatoire)" className={field} />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md border border-rust px-3 py-1.5 text-sm font-semibold text-rust disabled:opacity-50"
      >
        Annuler la livraison
      </button>
      <Feedback state={state} />
    </form>
  );
}

function PlanForm({ orderId, items }: { orderId: string; items: DeliveryItemInfo[] }) {
  // Champs gardés en état (pas de <form>) : la saisie n'est pas vidée en cas d'erreur.
  const remaining = (i: DeliveryItemInfo) => Math.max(i.ordered - i.delivered - i.planned, 0);
  // Par défaut, chaque ligne propose tout le reste à livrer ; la saisie est conservée en état.
  const [qty, setQty] = useState<Record<string, string>>({});
  const valueOf = (i: DeliveryItemInfo) => qty[i.id] ?? String(remaining(i));
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<DeliveryActionState>({});
  const [pending, startTransition] = useTransition();

  const open = items.filter((i) => remaining(i) > 0);
  if (open.length === 0) {
    return <p className="text-sm text-ink-soft">Toutes les quantités sont déjà livrées ou planifiées.</p>;
  }

  function submit() {
    const lines = open
      .map((i) => ({ orderItemId: i.id, quantity: Math.floor(Number(valueOf(i))) }))
      .filter((l) => l.quantity > 0);
    const data = new FormData();
    data.set("orderId", orderId);
    data.set("plannedDate", date);
    data.set("note", note);
    data.set("lines", JSON.stringify(lines));
    startTransition(async () => {
      const result = await planDeliveryAction({}, data);
      setState(result);
      if (result.success) {
        setNote("");
        setQty({});
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {open.map((i) => (
          <div key={i.id} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="min-w-[160px] flex-1">{i.name}</span>
            <span className="text-xs text-ink-soft">
              reste {remaining(i)} / {i.ordered}
            </span>
            <input
              type="number"
              min={0}
              max={remaining(i)}
              value={valueOf(i)}
              onChange={(e) => setQty((q) => ({ ...q, [i.id]: e.target.value }))}
              aria-label={`Quantité à livrer : ${i.name}`}
              className={`${field} w-24`}
            />
          </div>
        ))}
      </div>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={1000}
        placeholder="Observation (facultatif)"
        className={field}
      />
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="self-start rounded-md bg-rust px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Prévoir cette livraison
      </button>
      <PlanFeedback state={state} />
    </div>
  );
}

function PlanFeedback({ state }: { state: DeliveryActionState }) {
  if (state.error) {
    return (
      <p className="text-sm font-medium text-rust-dark" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.success) return <p className="text-sm font-medium text-green">{state.message ?? "Enregistré."}</p>;
  return null;
}

export function DeliveryPanel({
  orderId,
  items,
  deliveries,
  canPlan,
}: {
  orderId: string;
  items: DeliveryItemInfo[];
  deliveries: DeliveryInfo[];
  canPlan: boolean;
}) {
  return (
    <section className={panel}>
      <h2 className="font-display text-lg font-bold">Livraisons</h2>
      <p className="mt-1 text-xs text-ink-soft">
        Le stock ne sort qu&apos;au moment où une livraison est marquée « effectuée », une seule fois par ligne.
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-ink-soft">
            <tr>
              <th className="py-1.5 pr-3">Produit</th>
              <th className="py-1.5 pr-3">Commandé</th>
              <th className="py-1.5 pr-3">Livré</th>
              <th className="py-1.5">Prévu</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t border-border-egbm/60">
                <td className="py-1.5 pr-3">{i.name}</td>
                <td className="py-1.5 pr-3 font-mono">{i.ordered}</td>
                <td className="py-1.5 pr-3 font-mono">{i.delivered}</td>
                <td className="py-1.5 font-mono">{i.planned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deliveries.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Aucune livraison enregistrée pour cette commande.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {deliveries.map((d) => {
            const open = d.status === "PREVUE" || d.status === "EN_COURS";
            return (
              <li key={d.id} className="rounded-md border border-border-egbm/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm">
                    <span
                      className={`mr-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${DELIVERY_CLASSES[d.status]}`}
                    >
                      {DELIVERY_LABELS[d.status]}
                    </span>
                    {d.status === "EFFECTUEE" && d.deliveredAt
                      ? `Livrée le ${formatDateFr(d.deliveredAt)}`
                      : `Prévue le ${formatDateFr(d.plannedDate)}`}
                  </div>
                  <div className="text-xs text-ink-soft">
                    Créée par {d.authorName} · {formatDateTimeFr(d.createdAt)}
                  </div>
                </div>
                <div className="mt-1 text-sm text-ink-soft">
                  {d.lines.map((l) => `${l.quantity} × ${l.name}`).join(" · ")}
                </div>
                {d.note && <div className="mt-1 text-xs italic">« {d.note} »</div>}
                {open && (
                  <div className="mt-3 flex flex-wrap items-start gap-3">
                    {d.status === "PREVUE" && (
                      <ActionButton action={startDeliveryAction} deliveryId={d.id} label="Marquer expédiée" />
                    )}
                    <ActionButton
                      action={completeDeliveryAction}
                      deliveryId={d.id}
                      label="Marquer livrée"
                      primary
                    />
                    <details className="text-sm">
                      <summary className="cursor-pointer font-semibold text-rust">Reporter</summary>
                      <div className="mt-2 max-w-xs">
                        <RescheduleForm deliveryId={d.id} plannedDate={d.plannedDate} />
                      </div>
                    </details>
                    <details className="text-sm">
                      <summary className="cursor-pointer font-semibold text-rust">Annuler</summary>
                      <div className="mt-2 max-w-xs">
                        <CancelForm deliveryId={d.id} />
                      </div>
                    </details>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {canPlan && (
        <div className="mt-5 border-t border-border-egbm/60 pt-4">
          <h3 className="font-display text-base font-bold">Prévoir une livraison</h3>
          <div className="mt-2">
            <PlanForm orderId={orderId} items={items} />
          </div>
        </div>
      )}
    </section>
  );
}
