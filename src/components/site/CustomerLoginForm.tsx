"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { customerLoginAction, type CustomerLoginState } from "@/lib/actions/customer-auth";

const initialState: CustomerLoginState = {};

export function CustomerLoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(customerLoginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="redirect" value={redirectTo ?? ""} />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        autoComplete="email"
        className="rounded-md border border-border-egbm bg-white px-3 py-3 text-sm outline-none focus:border-rust"
      />
      <div className="relative">
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="Mot de passe"
          autoComplete="current-password"
          className="w-full rounded-md border border-border-egbm bg-white px-3 py-3 pr-16 text-sm outline-none focus:border-rust"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-soft"
        >
          {showPassword ? "Masquer" : "Afficher"}
        </button>
      </div>

      {state.error && (
        <p className="text-sm font-medium text-rust-dark" role="alert">
          {state.error}
        </p>
      )}

      <Link
        href="/compte/mot-de-passe-oublie"
        className="-mt-1 text-right text-xs font-semibold text-ink-soft hover:text-ink"
      >
        Mot de passe oublié ?
      </Link>

      <button
        type="submit"
        disabled={pending}
        className="mt-1 flex items-center justify-center gap-2 rounded-md bg-rust py-3 font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {pending ? "Connexion..." : "Se connecter"}
      </button>

      <Link href="/compte/inscription" className="text-center text-xs font-semibold text-ink-soft hover:text-ink">
        Pas encore de compte ? Créer un compte
      </Link>
    </form>
  );
}
