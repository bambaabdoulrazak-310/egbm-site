"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  assignResponsibleAction,
  changeOrderStatusAction,
  reactivateOrderAction,
  updateExpectedDateAction,
  type OrderActionState,
} from "@/lib/actions/orders";
import {
  NOTE_REQUIRED_FOR,
  STATUS_LABELS,
  TRANSITIONS,
  toDateInput,
  type OrderStatusValue,
} from "@/lib/order-workflow";

const initial: OrderActionState = {};

const field = "w-full rounded-md border border-border-egbm bg-white p-2 text-sm";
const panel = "rounded-lg border border-border-egbm bg-white p-4 shadow-sm";

// Après une action réussie, on recharge les données de la page (statut, chronologie, boutons proposés).
function useRefreshOnSuccess(state: OrderActionState) {
  const router = useRouter();
  useEffect(() => {
    if (state.success) router.refresh();
  }, [state, router]);
}

function Feedback({ state }: { state: OrderActionState }) {
  useRefreshOnSuccess(state);
  if (state.error) {
    return (
      <p className="text-sm font-medium text-rust-dark" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return <p className="text-sm font-medium text-green">{state.message ?? "Enregistré."}</p>;
  }
  return null;
}

// Propose uniquement les transitions autorisées depuis le statut actuel.
export function StatusPanel({ orderId, status }: { orderId: string; status: OrderStatusValue }) {
  const [state, formAction, pending] = useActionState(changeOrderStatusAction, initial);
  const next = TRANSITIONS[status];
  if (next.length === 0) return null;

  return (
    <form action={formAction} className={`${panel} flex flex-col gap-3`}>
      <h3 className="font-display text-lg font-bold">Changer le statut</h3>
      <input type="hidden" name="id" value={orderId} />
      <textarea
        name="note"
        rows={2}
        maxLength={1000}
        placeholder="Observation (obligatoire pour une annulation)"
        className={field}
      />
      <div className="flex flex-wrap gap-2">
        {next.map((s) => (
          <button
            key={s}
            type="submit"
            name="to"
            value={s}
            disabled={pending}
            className={`rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
              NOTE_REQUIRED_FOR.includes(s) ? "border border-rust text-rust" : "bg-rust text-white"
            }`}
          >
            {s === "ANNULEE" ? "Annuler la commande" : `→ ${STATUS_LABELS[s]}`}
          </button>
        ))}
      </div>
      <Feedback state={state} />
    </form>
  );
}

// Commande terminée ou annulée : réactivation réservée à l'administrateur, avec justification.
export function ReactivatePanel({ orderId, isAdmin }: { orderId: string; isAdmin: boolean }) {
  const [state, formAction, pending] = useActionState(reactivateOrderAction, initial);

  if (!isAdmin) {
    return (
      <div className={`${panel} text-sm text-ink-soft`}>
        Cette commande est clôturée. Seul un administrateur peut la réactiver (avec justification).
      </div>
    );
  }

  return (
    <form action={formAction} className={`${panel} flex flex-col gap-3`}>
      <h3 className="font-display text-lg font-bold">Réactiver la commande</h3>
      <input type="hidden" name="id" value={orderId} />
      <textarea
        name="note"
        rows={2}
        required
        minLength={5}
        maxLength={1000}
        placeholder="Justification obligatoire (enregistrée dans l'historique)"
        className={field}
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md border border-rust px-4 py-2 text-sm font-semibold text-rust disabled:opacity-50"
      >
        Réactiver (retour à « Confirmée »)
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function DatePanel({
  orderId,
  expectedDate,
}: {
  orderId: string;
  expectedDate: Date | null;
}) {
  const [state, formAction, pending] = useActionState(updateExpectedDateAction, initial);

  return (
    <form action={formAction} className={`${panel} flex flex-col gap-3`}>
      <h3 className="font-display text-lg font-bold">
        {expectedDate ? "Modifier la date prévue" : "Définir la date prévue"}
      </h3>
      <input type="hidden" name="id" value={orderId} />
      <input
        key={toDateInput(expectedDate)}
        type="date"
        name="date"
        required
        defaultValue={toDateInput(expectedDate)}
        className={field}
      />
      <textarea
        name="note"
        rows={2}
        maxLength={1000}
        required={expectedDate !== null}
        placeholder={expectedDate ? "Raison du changement (obligatoire)" : "Observation (facultatif)"}
        className={field}
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-rust px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Enregistrer la date
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function ResponsiblePanel({
  orderId,
  responsibleId,
  users,
}: {
  orderId: string;
  responsibleId: string | null;
  users: Array<{ id: string; name: string }>;
}) {
  const [state, formAction, pending] = useActionState(assignResponsibleAction, initial);

  return (
    <form action={formAction} className={`${panel} flex flex-col gap-3`}>
      <h3 className="font-display text-lg font-bold">Employé responsable</h3>
      <input type="hidden" name="id" value={orderId} />
      <select
        key={responsibleId ?? "none"}
        name="responsibleId"
        defaultValue={responsibleId ?? ""}
        aria-label="Employé responsable"
        className={field}
      >
        <option value="">Aucun</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-rust px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Affecter
      </button>
      <Feedback state={state} />
    </form>
  );
}

// Actions rapides dans le bloc « À confirmer » (liste) : confirmer ou refuser une demande du site.
export function QuickConfirm({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState(changeOrderStatusAction, initial);
  useRefreshOnSuccess(state);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={orderId} />
      <button
        type="submit"
        name="to"
        value="CONFIRMEE"
        disabled={pending}
        className="rounded-md bg-green px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        Confirmer
      </button>
      {state.error && (
        <span className="text-xs font-medium text-rust-dark" role="alert">
          {state.error}
        </span>
      )}
    </form>
  );
}
