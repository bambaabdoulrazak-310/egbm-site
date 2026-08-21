"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Mail } from "lucide-react";
import { changeEmailAction, type EmailFormState } from "@/lib/actions/account";

const initialState: EmailFormState = {};

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction, pending] = useActionState(changeEmailAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-4 flex max-w-sm flex-col gap-3 rounded-lg border border-border-egbm bg-cream p-4"
    >
      <p className="text-sm text-ink-soft">
        Email actuel : <span className="font-semibold text-ink">{currentEmail}</span>
      </p>
      <div>
        <label className="text-sm font-medium">Nouvel email</label>
        <input
          name="nouvelEmail"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-border-egbm p-2"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Mot de passe (confirmation)</label>
        <div className="relative mt-1">
          <input
            name="motdepasseActuel"
            type={visible ? "text" : "password"}
            required
            className="w-full rounded-md border border-border-egbm p-2 pr-16"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-soft"
          >
            {visible ? "Masquer" : "Afficher"}
          </button>
        </div>
      </div>

      {state.error && <p className="text-sm font-medium text-rust-dark">{state.error}</p>}
      {state.success && <p className="text-sm font-medium text-green">Email mis à jour avec succès.</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-1.5 rounded-md bg-green px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        <Mail size={16} /> {pending ? "Mise à jour..." : "Changer l'email"}
      </button>
    </form>
  );
}
