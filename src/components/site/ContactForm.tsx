"use client";

import { useActionState } from "react";
import { sendContactMessageAction, type ContactState } from "@/lib/actions/contact";
import { AntiSpamFields } from "@/components/site/AntiSpamFields";

const initialState: ContactState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessageAction, initialState);

  if (state.success) {
    return (
      <p className="rounded-md bg-green p-4 font-semibold text-white">
        Message envoyé — merci, nous vous répondrons rapidement.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <AntiSpamFields />
      <input
        name="name"
        required
        placeholder="Votre nom"
        className="rounded-md border border-border-egbm bg-cream p-3"
      />
      <textarea
        name="message"
        required
        placeholder="Votre message"
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
        {pending ? "Envoi..." : "Envoyer"}
      </button>
    </form>
  );
}
