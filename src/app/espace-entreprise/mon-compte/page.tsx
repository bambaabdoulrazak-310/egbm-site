import type { Metadata } from "next";
import { requireSession } from "@/lib/auth-guard";
import { ChangePasswordForm } from "@/components/entreprise/ChangePasswordForm";

export const metadata: Metadata = { title: "Mon compte — Espace Entreprise" };

export default async function MonComptePage() {
  const session = await requireSession();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold md:text-4xl">Mon compte</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Connecté en tant que <span className="font-semibold">{session.name}</span>.
      </p>
      <ChangePasswordForm />
    </div>
  );
}
