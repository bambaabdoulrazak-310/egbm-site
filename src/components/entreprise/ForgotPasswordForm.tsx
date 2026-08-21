"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type RequestResetState } from "@/lib/actions/password-reset";

const initialState: RequestResetState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  if (state.success) {
    return (
      <p className="text-sm text-ink-soft">
        Si un compte existe avec cet email, un lien de réinitialisation vient de lui être envoyé.
        Vérifiez votre boîte de réception (et vos spams).
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        autoComplete="email"
        className="rounded-md border border-border-egbm bg-white px-3 py-3 text-sm outline-none focus:border-rust"
      />
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
        {pending ? "Envoi..." : "Recevoir le lien par email"}
      </button>
    </form>
  );
}
