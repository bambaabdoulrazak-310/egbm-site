import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/entreprise/ForgotPasswordForm";

export const metadata: Metadata = { title: "Mot de passe oublié — Espace Entreprise" };

export default function MotDePasseOubliePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-alt px-5">
      <div className="w-full max-w-sm rounded-lg border border-border-egbm bg-cream p-6">
        <div className="mb-4 flex flex-col items-center">
          <Image
            src="/logo.jpg"
            alt="Logo EGBM"
            width={56}
            height={56}
            className="mb-2 rounded-full object-cover"
          />
          <h1 className="font-display text-2xl font-extrabold">Mot de passe oublié</h1>
          <p className="text-center text-xs text-ink-soft">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>
        </div>
        <ForgotPasswordForm />
        <Link
          href="/connexion"
          className="mt-4 block text-center text-xs font-semibold text-ink-soft hover:text-ink"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
