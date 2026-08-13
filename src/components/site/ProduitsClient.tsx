"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Film, Plus } from "lucide-react";
import { useCart } from "@/components/site/CartProvider";
import {
  CATEGORY_ICON,
  CATEGORY_LABELS,
  CATEGORY_TEXT_COLOR,
  formatFCFA,
} from "@/lib/catalog";
import type { ProductCategory } from "@/generated/prisma/enums";

export interface ProduitListItem {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  media: Array<{ url: string; type: "IMAGE" | "VIDEO" }>;
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProductCategory[];

export function ProduitsClient({ products }: { products: ProduitListItem[] }) {
  const [filter, setFilter] = useState<ProductCategory | "TOUS">("TOUS");
  const { addToCart } = useCart();

  const filtered = useMemo(
    () => (filter === "TOUS" ? products : products.filter((p) => p.category === filter)),
    [products, filter]
  );

  return (
    <div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("TOUS")}
          className={`rounded-full border border-border-egbm px-3 py-1.5 text-sm font-semibold ${
            filter === "TOUS" ? "bg-rust text-white" : "bg-cream text-ink"
          }`}
        >
          Tous
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full border border-border-egbm px-3 py-1.5 text-sm font-semibold ${
              filter === c ? "bg-rust text-white" : "bg-cream text-ink"
            }`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-ink-soft">Aucun produit dans cette catégorie pour le moment.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {filtered.map((p) => {
            const Icon = CATEGORY_ICON[p.category];
            const cover = p.media[0];
            return (
              <div
                key={p.id}
                className="flex flex-col rounded-lg border border-border-egbm bg-cream p-4"
              >
                <div className="relative mb-3 flex h-24 items-center justify-center overflow-hidden rounded-md bg-bg-alt">
                  {cover?.type === "IMAGE" ? (
                    <Image src={cover.url} alt={p.name} fill className="object-cover" />
                  ) : cover?.type === "VIDEO" ? (
                    <Film size={36} className={CATEGORY_TEXT_COLOR[p.category]} />
                  ) : (
                    <Icon size={36} className={CATEGORY_TEXT_COLOR[p.category]} />
                  )}
                </div>
                <div
                  className={`text-xs font-semibold uppercase tracking-wide ${CATEGORY_TEXT_COLOR[p.category]}`}
                >
                  {CATEGORY_LABELS[p.category]}
                </div>
                <div className="mt-1 flex-1 font-semibold">{p.name}</div>
                <div className="mt-2 font-mono font-semibold">{formatFCFA(p.price)}</div>
                <div className="text-xs text-ink-soft">
                  {p.stock > 0 ? `${p.stock} en stock` : "Rupture de stock"}
                </div>
                <button
                  onClick={() => addToCart(p.id)}
                  disabled={p.stock <= 0}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-rust py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Plus size={15} /> Ajouter à la commande
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
