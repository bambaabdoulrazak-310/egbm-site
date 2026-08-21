"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { resetPasswordAction, type ResetPasswordState } from "@/lib/actions/password-reset";

const initialState: ResetPasswordState = {};

function PasswordField({ label, name }: { label: string; name: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        name={name}
        type={visible ? "text" : "password"}
        required
        minLength={8}
        placeholder={label}
        autoComplete="new-password"
        className="w-full rounded-md border border-border-egbm bg-white px-3 py-3 pr-16 text-sm outline-none focus:border-rust"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-soft"
      >
        {visible ? "Masquer" : "Afficher"}
      </button>
    </div>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-green">
          Votre mot de passe a été mis à jour avec succès.
        </p>
        <Link
          href="/connexion"
          className="flex items-center justify-center gap-2 rounded-md bg-green py-3 font-semibold text-white"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="token" value={token} />
      <PasswordField label="Nouveau mot de passe" name="nouveauMotdepasse" />
      <PasswordField label="Confirmer le nouveau mot de passe" name="confirmerMotdepasse" />
      {state.error && (
        <p className="text-sm font-medium text-rust-dark" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 flex items-center justify-center gap-2 rounded-md bg-green py-3 font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {pending ? "Mise à jour..." : "Réinitialiser le mot de passe"}
      </button>
    </form>
  );
}
