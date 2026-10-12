import type { Metadata } from "next";
import Link from "next/link";
import { CustomerForgotPasswordForm } from "@/components/site/CustomerForgotPasswordForm";

export const metadata: Metadata = { title: "Mot de passe oublié — Mon compte" };

export default function CompteMotDePasseOubliePage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col">
      <h1 className="font-display text-3xl font-extrabold">Mot de passe oublié</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Entrez votre email pour recevoir un lien de réinitialisation.
      </p>
      <div className="mt-6 rounded-lg border border-border-egbm bg-cream p-6">
        <CustomerForgotPasswordForm />
        <Link
          href="/compte/connexion"
          className="mt-4 block text-center text-xs font-semibold text-ink-soft hover:text-ink"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
