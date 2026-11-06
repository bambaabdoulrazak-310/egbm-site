"use client";

import { useActionState, useState, useTransition } from "react";
import {
  changeSupplierStatusAction,
  receiveGoodsAction,
  type SupplierActionState,
} from "@/lib/actions/supplier-orders";
import {
  SUPPLIER_LABELS,
  SUPPLIER_TRANSITIONS,
  isSupplierBackward,
  type SupplierStatusValue,
} from "@/lib/supplier-workflow";
import { Feedback, field, panel, useRefreshOnSuccess } from "@/components/entreprise/commandes/OrderActions";

const initial: SupplierActionState = {};

// Propose uniquement les transitions autorisées depuis le statut actuel de la commande fournisseur.
export function SupplierStatusPanel({ orderId, status }: { orderId: string; status: SupplierStatusValue }) {
  const [state, formAction, pending] = useActionState(changeSupplierStatusAction, initial);
  const next = SUPPLIER_TRANSITIONS[status];
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
              s === "ANNULEE" || isSupplierBackward(status, s)
                ? "border border-rust text-rust"
                : "bg-rust text-white"
            }`}
          >
            {s === "ANNULEE"
              ? "Annuler la commande"
              : isSupplierBackward(status, s)
                ? `← Revenir à « ${SUPPLIER_LABELS[s]} »`
                : `→ ${SUPPLIER_LABELS[s]}`}
          </button>
        ))}
      </div>
      <Feedback state={state} />
    </form>
  );
}

export interface ReceiveItem {
  id: string;
  name: string;
  quantity: number;
  receivedQty: number;
}

// Réception de marchandises : les quantités saisies entrent en stock une seule fois.
export function ReceivePanel({ orderId, items }: { orderId: string; items: ReceiveItem[] }) {
  const remaining = (i: ReceiveItem) => Math.max(i.quantity - i.receivedQty, 0);
  const open = items.filter((i) => remaining(i) > 0);
  // Les champs sont conservés en état (pas de <form>) pour ne pas être vidés en cas d'erreur.
  const [qty, setQty] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [state, setState] = useState<SupplierActionState>({});
  const [pending, startTransition] = useTransition();
  useRefreshOnSuccess(state);

  const valueOf = (i: ReceiveItem) => qty[i.id] ?? String(remaining(i));

  if (open.length === 0) {
    return (
      <div className={`${panel} text-sm text-ink-soft`}>Toutes les quantités commandées ont été reçues.</div>
    );
  }

  function submit() {
    const lines = open
      .map((i) => ({ itemId: i.id, quantity: Math.floor(Number(valueOf(i))) }))
      .filter((l) => l.quantity > 0);
    const data = new FormData();
    data.set("id", orderId);
    data.set("note", note);
    data.set("lines", JSON.stringify(lines));
    startTransition(async () => {
      const result = await receiveGoodsAction({}, data);
      setState(result);
      if (result.success) {
        setNote("");
        setQty({});
      }
    });
  }

  return (
    <div className={`${panel} flex flex-col gap-3`}>
      <h3 className="font-display text-lg font-bold">Enregistrer une réception</h3>
      <p className="text-xs text-ink-soft">
        Indiquez les quantités réellement reçues. Elles sont ajoutées au stock des produits.
      </p>
      {open.map((i) => (
        <div key={i.id} className="flex flex-wrap items-center gap-2 text-sm">
          <span className="min-w-[140px] flex-1">{i.name}</span>
          <span className="text-xs text-ink-soft">
            reste {remaining(i)} / {i.quantity}
          </span>
          <input
            type="number"
            min={0}
            max={remaining(i)}
            value={valueOf(i)}
            onChange={(e) => setQty((q) => ({ ...q, [i.id]: e.target.value }))}
            aria-label={`Quantité reçue : ${i.name}`}
            className={`${field} w-24`}
          />
        </div>
      ))}
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
        Enregistrer la réception
      </button>
      {state.error && (
        <p className="text-sm font-medium text-rust-dark" role="alert">
          {state.error}
        </p>
      )}
      {state.success && <p className="text-sm font-medium text-green">{state.message}</p>}
    </div>
  );
}
