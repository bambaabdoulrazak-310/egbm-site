"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { customerRegisterAction, type CustomerRegisterState } from "@/lib/actions/customer-auth";
import { AntiSpamFields } from "@/components/site/AntiSpamFields";

const initialState: CustomerRegisterState = {};

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

export function CustomerRegisterForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(customerRegisterAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <AntiSpamFields />
      <input type="hidden" name="redirect" value={redirectTo ?? ""} />
      <input
        name="name"
        required
        placeholder="Nom complet"
        autoComplete="name"
        className="rounded-md border border-border-egbm bg-white px-3 py-3 text-sm outline-none focus:border-rust"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        autoComplete="email"
        className="rounded-md border border-border-egbm bg-white px-3 py-3 text-sm outline-none focus:border-rust"
      />
      <input
        name="phone"
        required
        placeholder="Téléphone"
        autoComplete="tel"
        className="rounded-md border border-border-egbm bg-white px-3 py-3 text-sm outline-none focus:border-rust"
      />
      <PasswordField label="Mot de passe" name="password" />
      <PasswordField label="Confirmer le mot de passe" name="confirmPassword" />

      {state.error && (
        <p className="text-sm font-medium text-rust-dark" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 flex items-center justify-center gap-2 rounded-md bg-rust py-3 font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {pending ? "Création..." : "Créer mon compte"}
      </button>

      <Link href="/compte/connexion" className="text-center text-xs font-semibold text-ink-soft hover:text-ink">
        Déjà un compte ? Se connecter
      </Link>
    </form>
  );
}
