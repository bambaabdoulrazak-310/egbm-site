"use client";

import { Trash2 } from "lucide-react";
import { deleteContactMessageAction } from "@/lib/actions/contact";
import { deleteQuoteRequestAction } from "@/lib/actions/quotes";

export interface AdminContactMessage {
  id: string;
  name: string;
  message: string;
  createdAt: Date;
}

export interface AdminQuoteRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  message: string;
  createdAt: Date;
}

export function AdminDemandesClient({
  quotes,
  messages,
}: {
  quotes: AdminQuoteRequest[];
  messages: AdminContactMessage[];
}) {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold md:text-4xl">Demandes reçues</h1>

      <section className="mt-5">
        <h2 className="font-display text-xl font-bold">Demandes de devis</h2>
        {quotes.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">Aucune demande de devis pour le moment.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {quotes.map((q) => (
              <div
                key={q.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border-egbm bg-cream p-4"
              >
                <div>
                  <div className="font-semibold">{q.clientName}</div>
                  <div className="text-xs text-ink-soft">
                    {q.clientPhone}
                    {q.clientEmail ? ` · ${q.clientEmail}` : ""} ·{" "}
                    {q.createdAt.toISOString().slice(0, 10)}
                  </div>
                  <div className="mt-1 text-sm">{q.message}</div>
                </div>
                <form action={deleteQuoteRequestAction}>
                  <input type="hidden" name="id" value={q.id} />
                  <button type="submit" aria-label="Supprimer">
                    <Trash2 size={16} className="text-rust" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Messages de contact</h2>
        {messages.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">Aucun message pour le moment.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border-egbm bg-cream p-4"
              >
                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs text-ink-soft">{m.createdAt.toISOString().slice(0, 10)}</div>
                  <div className="mt-1 text-sm">{m.message}</div>
                </div>
                <form action={deleteContactMessageAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" aria-label="Supprimer">
                    <Trash2 size={16} className="text-rust" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
