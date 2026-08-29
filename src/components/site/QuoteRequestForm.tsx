"use client";

import { useActionState } from "react";
import { createQuoteRequestAction, type QuoteRequestState } from "@/lib/actions/quotes";
import { AntiSpamFields } from "@/components/site/AntiSpamFields";

const initialState: QuoteRequestState = {};

export function QuoteRequestForm() {
  const [state, formAction, pending] = useActionState(createQuoteRequestAction, initialState);

  if (state.success) {
    return (
      <p className="rounded-md bg-green p-4 font-semibold text-white">
        Demande envoyée — nous vous recontacterons rapidement avec un devis.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <AntiSpamFields />
      <input
        name="clientName"
        required
        placeholder="Nom complet"
        className="rounded-md border border-border-egbm bg-cream p-3"
      />
      <input
        name="clientPhone"
        required
        placeholder="Téléphone"
        className="rounded-md border border-border-egbm bg-cream p-3"
      />
      <input
        name="clientEmail"
        type="email"
        placeholder="Email (optionnel)"
        className="rounded-md border border-border-egbm bg-cream p-3"
      />
      <textarea
        name="message"
        required
        placeholder="Décrivez votre besoin (matériaux, quantités, délais...)"
        rows={5}
        className="rounded-md border border-border-egbm bg-cream p-3"
      />
      {state.error && (
        <p className="text-sm font-medium text-rust-dark" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-rust py-3 font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Envoi..." : "Demander un devis"}
      </button>
    </form>
  );
}
