"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export interface OrderSummaryData {
  enCours: number;
  enAttente: number;
  enPreparation: number;
  enLivraison: number;
  enRetard: number;
  terminees: number;
}

const POLL_MS = 20_000;

const CARDS: Array<{
  key: keyof OrderSummaryData;
  label: string;
  hint?: string;
  href: string;
  tone?: "alert";
}> = [
  { key: "enCours", label: "Commandes en cours", hint: "non terminées", href: "?statut=toutes" },
  { key: "enAttente", label: "En attente de confirmation", href: "?statut=NOUVELLE" },
  { key: "enPreparation", label: "En préparation", hint: "confirmées ou en préparation", href: "?statut=actives" },
  { key: "enLivraison", label: "En livraison", href: "?statut=EN_LIVRAISON" },
  { key: "enRetard", label: "En retard", hint: "date prévue dépassée", href: "?retard=1", tone: "alert" },
  { key: "terminees", label: "Terminées", href: "?onglet=historique&statut=LIVREE" },
];

// Indicateurs calculés côté serveur ; rafraîchis automatiquement (même principe que la pastille de la barre latérale).
export function OrderSummaryCards({ initial }: { initial: OrderSummaryData }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const last = useRef(JSON.stringify(initial));

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const res = await fetch("/api/orders/summary", { cache: "no-store" });
        if (!res.ok) return;
        const next = (await res.json()) as OrderSummaryData;
        if (cancelled) return;
        const serialized = JSON.stringify(next);
        if (serialized !== last.current) {
          last.current = serialized;
          setData(next);
          // Les listes affichées sous les indicateurs sont rechargées quand les chiffres changent.
          router.refresh();
        }
      } catch {
        // silencieux : les indicateurs ne sont pas critiques
      }
    }

    const interval = setInterval(refresh, POLL_MS);
    window.addEventListener("focus", refresh);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [router]);

  return (
    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {CARDS.map((c) => {
        const value = data[c.key];
        const alert = c.tone === "alert" && value > 0;
        return (
          <Link
            key={c.key}
            href={c.href}
            className={`rounded-lg border bg-white p-4 shadow-sm transition-colors hover:border-rust ${
              alert ? "border-rust" : "border-border-egbm"
            }`}
          >
            <div className="text-xs text-ink-soft">{c.label}</div>
            <div className={`mt-1 font-display text-3xl font-bold ${alert ? "text-rust" : ""}`}>{value}</div>
            {c.hint && <div className="mt-0.5 text-[11px] text-ink-soft">{c.hint}</div>}
          </Link>
        );
      })}
    </div>
  );
}
