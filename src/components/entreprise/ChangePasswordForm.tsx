"use client";

import { useActionState, useEffect, useRef } from "react";
import { KeyRound } from "lucide-react";
import { changePasswordAction, type PasswordFormState } from "@/lib/actions/account";

const initialState: PasswordFormState = {};

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
      <div>
        <label className="text-sm font-medium">Mot de passe actuel</label>
        <input
          name="motdepasseActuel"
          type="password"
          required
          className="mt-1 w-full rounded-md border border-border-egbm p-2"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Nouveau mot de passe</label>
        <input
          name="nouveauMotdepasse"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-md border border-border-egbm p-2"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Confirmer le nouveau mot de passe</label>
        <input
          name="confirmerMotdepasse"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-md border border-border-egbm p-2"
        />
      </div>

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
