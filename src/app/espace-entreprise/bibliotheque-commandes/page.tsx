import type { Metadata } from "next";
import { Library } from "lucide-react";
import { requireSession } from "@/lib/auth-guard";

export const metadata: Metadata = { title: "Bibliothèque des commandes — Espace Entreprise" };
export const revalidate = 0;

export default async function BibliothequeCommandesPage() {
  await requireSession();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold md:text-4xl">Bibliothèque des commandes</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Le registre de toutes les commandes, passées et actuelles.
      </p>

      <div className="mt-6 flex flex-col items-center rounded-lg border border-border-egbm bg-white p-8 text-center shadow-sm">
        <Library size={32} className="text-cement" />
        <p className="mt-3 font-display text-lg font-bold">Page en cours de construction</p>
        <p className="mt-1 max-w-md text-sm text-ink-soft">
          Le contenu de la bibliothèque sera ajouté étape par étape.
        </p>
      </div>
    </div>
  );
}
