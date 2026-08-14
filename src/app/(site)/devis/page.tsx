import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { QuoteRequestForm } from "@/components/site/QuoteRequestForm";

export const metadata: Metadata = { title: "Demander un devis" };

export default function DevisPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold md:text-5xl">Demander un devis</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Décrivez-nous votre besoin (matériaux de construction, intrants agro-chimiques,
        matériaux industriels) et nous vous recontacterons rapidement avec un devis adapté.
      </p>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <QuoteRequestForm />
        <div className="flex flex-col justify-center rounded-lg border border-border-egbm bg-cream p-5">
          <div className="font-display text-lg font-bold">Besoin urgent ?</div>
          <p className="mt-1 text-sm text-ink-soft">
            Contactez-nous directement sur WhatsApp pour une réponse rapide.
          </p>
          <a
            href="https://wa.me/2250556804286"
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex w-fit items-center gap-2 rounded-md bg-green px-4 py-2 font-semibold text-white"
          >
            <MessageCircle size={18} /> Discuter sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
