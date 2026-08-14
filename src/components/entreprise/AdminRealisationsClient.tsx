"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/catalog";
import {
  saveRealisationAction,
  deleteRealisationAction,
  type RealisationFormState,
} from "@/lib/actions/realisations";
import type { ProductCategory } from "@/generated/prisma/enums";

export interface AdminRealisation {
  id: string;
  title: string;
  description: string;
  location: string | null;
  category: ProductCategory | null;
  photoUrl: string | null;
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProductCategory[];
const initialState: RealisationFormState = {};

export function AdminRealisationsClient({ realisations }: { realisations: AdminRealisation[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminRealisation | null>(null);
  const [state, formAction, pending] = useActionState(saveRealisationAction, initialState);

  useEffect(() => {
    if (state.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowForm(false);
      setEditing(null);
    }
  }, [state.success]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold md:text-4xl">Réalisations</h1>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
            } else {
              setEditing(null);
              setShowForm(true);
            }
          }}
          className="flex items-center gap-1.5 rounded-md bg-green px-4 py-2 font-semibold text-white"
        >
          <Plus size={16} /> Nouvelle réalisation
        </button>
      </div>

      {showForm && (
        <form
          key={editing?.id ?? "new"}
          action={formAction}
          className="mt-4 grid gap-3 rounded-lg border border-border-egbm bg-cream p-4 md:grid-cols-4"
        >
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <input
            name="title"
            defaultValue={editing?.title}
            placeholder="Titre"
            required
            className="rounded-md border border-border-egbm p-2 md:col-span-2"
          />
          <input
            name="location"
            defaultValue={editing?.location ?? ""}
            placeholder="Lieu (optionnel)"
            className="rounded-md border border-border-egbm p-2"
          />
          <select
            name="category"
            defaultValue={editing?.category ?? ""}
            className="rounded-md border border-border-egbm p-2"
          >
            <option value="">Secteur (optionnel)</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            defaultValue={editing?.description}
            placeholder="Description"
            required
            className="rounded-md border border-border-egbm p-2 md:col-span-4"
            rows={2}
          />
          <div className="flex flex-wrap items-center gap-2 md:col-span-4">
            {editing?.photoUrl && (
              <Image
                src={editing.photoUrl}
                alt=""
                width={40}
                height={40}
                className="rounded-md object-cover"
              />
            )}
            <label className="flex items-center gap-1.5 text-sm text-ink-soft">
              Photo (jpg/png/webp) :
              <input
                type="file"
                name="photo"
                accept="image/jpeg,image/png,image/webp"
                className="text-sm"
              />
            </label>
            {state.error && <span className="text-sm font-medium text-rust-dark">{state.error}</span>}
            <button
              type="submit"
              disabled={pending}
              className="ml-auto rounded-md bg-rust px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {realisations.map((r) => (
          <div key={r.id} className="flex gap-3 rounded-lg border border-border-egbm bg-cream p-3">
            {r.photoUrl ? (
              <Image
                src={r.photoUrl}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 shrink-0 rounded-md object-cover"
              />
            ) : (
              <div className="h-16 w-16 shrink-0 rounded-md bg-bg-alt" />
            )}
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{r.title}</div>
              {r.location && (
                <div className="flex items-center gap-1 text-xs text-ink-soft">
                  <MapPin size={11} /> {r.location}
                </div>
              )}
              <div className="mt-1 line-clamp-2 text-sm text-ink-soft">{r.description}</div>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <button
                onClick={() => {
                  setEditing(r);
                  setShowForm(true);
                }}
                aria-label="Modifier"
              >
                <Pencil size={16} className="text-cement" />
              </button>
              <form action={deleteRealisationAction}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" aria-label="Supprimer">
                  <Trash2 size={16} className="text-rust" />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
