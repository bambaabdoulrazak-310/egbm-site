"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Film, Plus, Search } from "lucide-react";
import { useCart } from "@/components/site/CartProvider";
import {
  CATEGORY_ICON,
  CATEGORY_LABELS,
  CATEGORY_TEXT_COLOR,
  formatFCFA,
  type MediaItem,
} from "@/lib/catalog";
import type { ProductCategory } from "@/generated/prisma/enums";

export interface ProduitListItem {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  media: MediaItem[];
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProductCategory[];

type SortOption = "nom" | "prix-asc" | "prix-desc";

const SORT_LABELS: Record<SortOption, string> = {
  nom: "Nom (A→Z)",
  "prix-asc": "Prix croissant",
  "prix-desc": "Prix décroissant",
};

export function ProduitsClient({
  products,
  initialCategory,
}: {
  products: ProduitListItem[];
  initialCategory?: string;
}) {
  const [filter, setFilter] = useState<ProductCategory | "TOUS">(
    CATEGORIES.includes(initialCategory as ProductCategory)
      ? (initialCategory as ProductCategory)
      : "TOUS"
  );
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("nom");
  const { addToCart } = useCart();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = filter === "TOUS" ? products : products.filter((p) => p.category === filter);
    if (q) {
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    result = [...result].sort((a, b) => {
      if (sort === "prix-asc") return a.price - b.price;
      if (sort === "prix-desc") return b.price - a.price;
      return a.name.localeCompare(b.name, "fr");
    });
    return result;
  }, [products, filter, query, sort]);

  return (
    <div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full rounded-md border border-border-egbm bg-white py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-md border border-border-egbm bg-white px-3 py-2 text-sm font-medium"
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
            <option key={s} value={s}>
              {SORT_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
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
        <p className="mt-8 text-sm text-ink-soft">
          {query ? "Aucun produit ne correspond à votre recherche." : "Aucun produit dans cette catégorie pour le moment."}
        </p>
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
                <Link href={`/produits/${p.id}`}>
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
                  <div className="mt-1 flex-1 font-semibold hover:underline">{p.name}</div>
                </Link>
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
