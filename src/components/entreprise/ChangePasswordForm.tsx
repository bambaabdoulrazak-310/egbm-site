"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { KeyRound } from "lucide-react";
import { changePasswordAction, type PasswordFormState } from "@/lib/actions/account";

const initialState: PasswordFormState = {};

function PasswordField({
  label,
  name,
  autoComplete,
}: {
  label: string;
  name: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="relative mt-1">
        <input
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={name === "motdepasseActuel" ? undefined : 8}
          autoComplete={autoComplete}
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
  );
}

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-4 flex max-w-sm flex-col gap-3 rounded-lg border border-border-egbm bg-cream p-4"
    >
      <PasswordField
        label="Mot de passe actuel"
        name="motdepasseActuel"
        autoComplete="current-password"
      />
      <PasswordField
        label="Nouveau mot de passe"
        name="nouveauMotdepasse"
        autoComplete="new-password"
      />
      <PasswordField
        label="Confirmer le nouveau mot de passe"
        name="confirmerMotdepasse"
        autoComplete="new-password"
      />

      {state.error && <p className="text-sm font-medium text-rust-dark">{state.error}</p>}
      {state.success && (
        <p className="text-sm font-medium text-green">Mot de passe mis à jour avec succès.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-1.5 rounded-md bg-green px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        <KeyRound size={16} /> {pending ? "Mise à jour..." : "Changer le mot de passe"}
      </button>
    </form>
  );
}
