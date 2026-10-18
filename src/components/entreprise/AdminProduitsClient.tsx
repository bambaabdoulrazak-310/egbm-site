"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { Film, Pencil, Plus, Trash2 } from "lucide-react";
import { formatFCFA, type MediaItem } from "@/lib/catalog";
import { saveProductAction, deleteProductAction, type ProductFormState } from "@/lib/actions/products";
import { MediaUploader } from "@/components/entreprise/MediaUploader";

export interface AdminProduit {
  id: string;
  name: string;
  sectorId: string;
  sector: { name: string };
  price: number;
  stock: number;
  sold: number;
  description: string | null;
  media: MediaItem[];
}

const initialState: ProductFormState = {};

export function AdminProduitsClient({
  products,
  sectors,
}: {
  products: AdminProduit[];
  sectors: Array<{ id: string; name: string }>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminProduit | null>(null);
  const [state, formAction, pending] = useActionState(saveProductAction, initialState);

  useEffect(() => {
    // Referme le formulaire une fois le produit enregistré côté serveur.
    if (state.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowForm(false);
      setEditing(null);
    }
  }, [state.success]);

  const startEdit = (p: AdminProduit) => {
    setEditing(p);
    setShowForm(true);
  };

  const startCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold md:text-4xl">Produits</h1>
        <button
          onClick={() => (showForm ? setShowForm(false) : startCreate())}
          className="flex items-center gap-1.5 rounded-md bg-rust hover:bg-rust-dark px-4 py-2 font-semibold text-white"
        >
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      {showForm && (
        <form
          key={editing?.id ?? "new"}
          action={formAction}
          className="mt-4 grid gap-3 rounded-lg border border-border-egbm bg-white shadow-sm p-4 md:grid-cols-5"
        >
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <input
            name="name"
            defaultValue={editing?.name}
            placeholder="Nom du produit"
            required
            className="rounded-md border border-border-egbm p-2 md:col-span-2"
          />
          <select
            name="sectorId"
            defaultValue={editing?.sectorId ?? sectors[0]?.id}
            required
            aria-label="Secteur"
            className="rounded-md border border-border-egbm p-2"
          >
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            name="price"
            type="number"
            min={0}
            defaultValue={editing?.price}
            placeholder="Prix (FCFA)"
            required
            className="rounded-md border border-border-egbm p-2"
          />
          <input
            name="stock"
            type="number"
            min={0}
            defaultValue={editing?.stock}
            placeholder="Stock"
            className="rounded-md border border-border-egbm p-2"
          />
          <textarea
            name="description"
            defaultValue={editing?.description ?? ""}
            placeholder="Description (optionnel)"
            className="rounded-md border border-border-egbm p-2 md:col-span-5"
            rows={2}
          />

          <MediaUploader initialMedia={editing?.media} />

          <div className="flex flex-wrap items-center gap-2 md:col-span-5">
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

      <div className="mt-5 overflow-x-auto rounded-lg border border-border-egbm">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="bg-night text-white">
            <tr>
              <th className="p-3"></th>
              <th className="p-3 text-left">Produit</th>
              <th className="p-3 text-left">Secteur</th>
              <th className="p-3 text-left">Prix</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Ventes</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const cover = p.media[0];
              return (
                <tr key={p.id} className="border-t border-border-egbm bg-white shadow-sm">
                  <td className="p-3">
                    {cover ? (
                      cover.type === "IMAGE" ? (
                        <Image
                          src={cover.url}
                          alt=""
                          width={36}
                          height={36}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface">
                          <Film size={16} className="text-ink-soft" />
                        </div>
                      )
                    ) : (
                      <div className="h-9 w-9 rounded-md bg-surface" />
                    )}
                  </td>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{p.sector.name}</td>
                  <td className="p-3 font-mono">{formatFCFA(p.price)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">{p.sold}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(p)} aria-label="Modifier">
                        <Pencil size={16} className="text-cement" />
                      </button>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" aria-label="Supprimer">
                          <Trash2 size={16} className="text-rust" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
