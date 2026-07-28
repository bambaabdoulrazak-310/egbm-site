"use client";

import { useActionState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import {
  createPublicationAction,
  deletePublicationAction,
  type PublicationFormState,
} from "@/lib/actions/publications";

export interface AdminPublication {
  id: string;
  type: "PUBLICATION" | "EVENEMENT";
  title: string;
  text: string;
  date: Date;
}

const initialState: PublicationFormState = {};

export function AdminPublicationsClient({ publications }: { publications: AdminPublication[] }) {
  const [state, formAction, pending] = useActionState(createPublicationAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold md:text-4xl">
        Publications &amp; Événements
      </h1>

      <form
        ref={formRef}
        action={formAction}
        className="mt-4 grid gap-3 rounded-lg border border-border-egbm bg-cream p-4 md:grid-cols-4"
      >
        <select name="type" defaultValue="PUBLICATION" className="rounded-md border border-border-egbm p-2">
          <option value="PUBLICATION">Publication</option>
          <option value="EVENEMENT">Événement</option>
        </select>
        <input
          name="title"
          required
          placeholder="Titre"
          className="rounded-md border border-border-egbm p-2 md:col-span-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-rust px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {pending ? "..." : "Publier"}
        </button>
        <textarea
          name="text"
          required
          placeholder="Texte court"
          rows={2}
          className="rounded-md border border-border-egbm p-2 md:col-span-4"
        />
        {state.error && (
          <p className="text-sm font-medium text-rust-dark md:col-span-4">{state.error}</p>
        )}
      </form>

      <div className="mt-5 flex flex-col gap-3">
        {publications.map((u) => (
          <div
            key={u.id}
            className="flex items-start justify-between rounded-lg border border-border-egbm bg-cream p-4"
          >
            <div>
              <div
                className={`text-xs font-semibold uppercase ${
                  u.type === "EVENEMENT" ? "text-rust" : "text-green"
                }`}
              >
                {u.type === "EVENEMENT" ? "Événement" : "Publication"} ·{" "}
                {u.date.toISOString().slice(0, 10)}
              </div>
              <div className="font-display text-lg font-bold">{u.title}</div>
              <div className="text-sm text-ink-soft">{u.text}</div>
            </div>
            <form action={deletePublicationAction}>
              <input type="hidden" name="id" value={u.id} />
              <button type="submit" aria-label="Supprimer">
                <Trash2 size={16} className="text-rust" />
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
