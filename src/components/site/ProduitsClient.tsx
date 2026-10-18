"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Check,
  ChevronLeft,
  ChevronRight,
  Film,
  LayoutGrid,
  List,
  Minus,
  Plus,
  ShoppingCart,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useCart } from "@/components/site/CartProvider";
import { formatFCFA, type MediaItem } from "@/lib/catalog";
import { SectorIcon } from "@/components/site/SectorIcon";

export interface ProduitListItem {
  id: string;
  name: string;
  sectorId: string;
  sectorName: string;
  sectorIcon: string;
  price: number;
  stock: number;
  sold: number;
  createdAt: number;
  isNew: boolean;
  topSeller: boolean;
  media: MediaItem[];
}

export interface ProduitSector {
  id: string;
  slug: string;
  name: string;
  icon: string;
}

const PAGE_SIZE = 8;
const PRICE_STEP = 500;

type SortOption = "populaires" | "recents" | "nom" | "prix-asc" | "prix-desc";

const SORT_LABELS: Record<SortOption, string> = {
  populaires: "Plus populaires",
  recents: "Plus récents",
  nom: "Nom (A→Z)",
  "prix-asc": "Prix croissant",
  "prix-desc": "Prix décroissant",
};

function formatNumber(n: number) {
  return n.toLocaleString("fr-FR");
}

function pageNumbers(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: Array<number | "…"> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("…");
    result.push(p);
  });
  return result;
}

function ProductCard({ product: p, view }: { product: ProduitListItem; view: "grid" | "list" }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const cover = p.media[0];
  const inStock = p.stock > 0;
  const maxQty = Math.max(1, p.stock);

  function handleAdd() {
    addToCart(p.id, qty);
    setAdded(true);
    setQty(1);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1500);
  }

  const imageBlock = (
    <Link
      href={`/produits/${p.id}`}
      className={`relative block shrink-0 overflow-hidden bg-bg-alt ${
        view === "grid" ? "aspect-[4/3] w-full" : "aspect-[4/3] w-36 sm:w-56"
      }`}
    >
      <div className="flex h-full w-full items-center justify-center">
        {cover?.type === "IMAGE" ? (
          <Image
            src={cover.url}
            alt={p.name}
            fill
            sizes={view === "grid" ? "(min-width: 1024px) 25vw, 50vw" : "224px"}
            className="object-cover"
          />
        ) : cover?.type === "VIDEO" ? (
          <Film size={36} className="text-rust" />
        ) : (
          <SectorIcon name={p.sectorIcon} size={36} className="text-rust" />
        )}
      </div>
      <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
        {p.topSeller && (
          <span className="rounded bg-rust px-2 py-0.5 text-[11px] font-semibold text-white">
            Top vente
          </span>
        )}
        {p.isNew && (
          <span className="rounded bg-green px-2 py-0.5 text-[11px] font-semibold text-white">
            Nouveau
          </span>
        )}
      </div>
    </Link>
  );

  const actions = (
    <div className="flex items-center gap-2">
      <div className="flex shrink-0 items-center rounded-md border border-border-egbm bg-white">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={!inStock || qty <= 1}
          aria-label="Diminuer la quantité"
          className="px-2 py-2 text-ink disabled:opacity-40"
        >
          <Minus size={14} />
        </button>
        <span className="w-7 text-center text-sm font-semibold" aria-live="polite">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
          disabled={!inStock || qty >= maxQty}
          aria-label="Augmenter la quantité"
          className="px-2 py-2 text-ink disabled:opacity-40"
        >
          <Plus size={14} />
        </button>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={!inStock}
        className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
          added ? "bg-green" : "bg-rust hover:bg-rust-dark"
        }`}
      >
        {added ? (
          <>
            <Check size={15} /> Ajouté
          </>
        ) : (
          <>
            <ShoppingCart size={15} className="shrink-0" />
            <span className="truncate">Ajouter au panier</span>
          </>
        )}
      </button>
    </div>
  );

  const details = (
    <>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-rust">
        {p.sectorName}
      </div>
      <Link
        href={`/produits/${p.id}`}
        className="mt-1 block font-semibold leading-snug text-ink hover:text-rust"
      >
        {p.name}
      </Link>
      <div className="mt-2 font-display text-xl font-bold text-ink">{formatFCFA(p.price)}</div>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
        <span className={`h-2 w-2 rounded-full ${inStock ? "bg-green" : "bg-rust-dark"}`} />
        {inStock ? `En stock (${formatNumber(p.stock)})` : "Rupture de stock"}
      </div>
    </>
  );

  if (view === "list") {
    return (
      <article className="flex overflow-hidden rounded-lg border border-border-egbm bg-white shadow-sm">
        {imageBlock}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
          <div className="min-w-0">{details}</div>
          <div className="sm:w-64 sm:shrink-0">{actions}</div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border-egbm bg-white shadow-sm">
      {imageBlock}
      <div className="flex flex-1 flex-col p-4">
        {details}
        <div className="mt-auto pt-4">{actions}</div>
      </div>
    </article>
  );
}

export function ProduitsClient({
  products,
  sectors,
  initialSector,
  initialQuery = "",
}: {
  products: ProduitListItem[];
  sectors: ProduitSector[];
  initialSector?: string;
  initialQuery?: string;
}) {
  const bounds = useMemo(() => {
    if (products.length === 0) return { lo: 0, hi: 0 };
    const prices = products.map((p) => p.price);
    return {
      lo: Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP,
      hi: Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP,
    };
  }, [products]);

  // "TOUS" ou l'identifiant d'un secteur (le slug de l'adresse est converti en identifiant).
  const [category, setCategory] = useState<string>(
    sectors.find((s) => s.slug === initialSector)?.id ?? "TOUS"
  );
  const [minPrice, setMinPrice] = useState(bounds.lo);
  const [maxPrice, setMaxPrice] = useState(bounds.hi);
  const [showInStock, setShowInStock] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const [sort, setSort] = useState<SortOption>("populaires");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const listTop = useRef<HTMLDivElement>(null);

  const query = initialQuery.trim();
  const q = query.toLowerCase();

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { TOUS: products.length };
    for (const s of sectors) counts[s.id] = products.filter((p) => p.sectorId === s.id).length;
    return counts;
  }, [products, sectors]);
  const inStockCount = products.filter((p) => p.stock > 0).length;
  const outOfStockCount = products.length - inStockCount;

  const filtered = useMemo(() => {
    // Aucune case de disponibilité cochée = pas de filtre (on affiche tout).
    const stockFilterActive = showInStock !== showOutOfStock;
    const result = products.filter((p) => {
      if (category !== "TOUS" && p.sectorId !== category) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (p.price < minPrice || p.price > maxPrice) return false;
      if (stockFilterActive && (p.stock > 0) !== showInStock) return false;
      return true;
    });
    return result.sort((a, b) => {
      if (sort === "prix-asc") return a.price - b.price;
      if (sort === "prix-desc") return b.price - a.price;
      if (sort === "recents") return b.createdAt - a.createdAt;
      if (sort === "populaires" && b.sold !== a.sold) return b.sold - a.sold;
      return a.name.localeCompare(b.name, "fr");
    });
  }, [products, category, q, minPrice, maxPrice, showInStock, showOutOfStock, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const filtersActive =
    category !== "TOUS" ||
    minPrice !== bounds.lo ||
    maxPrice !== bounds.hi ||
    !showInStock ||
    !showOutOfStock;

  function resetFilters() {
    setCategory("TOUS");
    setMinPrice(bounds.lo);
    setMaxPrice(bounds.hi);
    setShowInStock(true);
    setShowOutOfStock(true);
    setPage(1);
  }

  function goToPage(next: number) {
    setPage(next);
    listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const sliderDisabled = bounds.lo === bounds.hi;
  const span = Math.max(1, bounds.hi - bounds.lo);
  const leftPct = ((minPrice - bounds.lo) / span) * 100;
  const rightPct = ((maxPrice - bounds.lo) / span) * 100;

  const checkbox = (checked: boolean) => (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
        checked ? "border-rust bg-rust text-white" : "border-border-egbm bg-white"
      }`}
    >
      {checked && <Check size={12} strokeWidth={3} />}
    </span>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Filtres */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          className="flex w-full items-center justify-between rounded-lg border border-border-egbm bg-white px-4 py-3 font-semibold lg:hidden"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={16} /> Filtres
          </span>
          <ChevronRight size={16} className={filtersOpen ? "rotate-90" : ""} />
        </button>

        <div
          className={`${
            filtersOpen ? "mt-3 block" : "hidden"
          } rounded-lg border border-border-egbm bg-white p-4 shadow-sm lg:mt-0 lg:block`}
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <SlidersHorizontal size={16} /> Filtres
            </h2>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!filtersActive}
              className="text-xs text-ink-soft hover:text-rust disabled:opacity-40"
            >
              Réinitialiser
            </button>
          </div>

          <fieldset className="mt-4">
            <legend className="font-display font-bold">Catégories</legend>
            <div className="mt-2 flex flex-col gap-1.5">
              {[{ id: "TOUS", name: "Tous les produits", icon: null }, ...sectors].map((s) => {
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={category === s.id}
                    onClick={() => {
                      setCategory(s.id);
                      setPage(1);
                    }}
                    className="flex items-center gap-2 py-0.5 text-left text-sm"
                  >
                    {checkbox(category === s.id)}
                    {s.icon && <SectorIcon name={s.icon} size={14} className="text-ink-soft" />}
                    <span className={category === s.id ? "font-semibold" : ""}>{s.name}</span>
                    <span className="text-ink-soft">({categoryCounts[s.id]})</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-5 border-t border-border-egbm/70 pt-4">
            <legend className="font-display font-bold">Prix (FCFA)</legend>
            <div className="relative mt-4 h-5">
              <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded bg-border-egbm" />
              <div
                className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-rust"
                style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
              />
              <input
                type="range"
                aria-label="Prix minimum"
                min={bounds.lo}
                max={bounds.hi}
                step={PRICE_STEP}
                value={minPrice}
                disabled={sliderDisabled}
                onChange={(e) => {
                  setMinPrice(Math.min(Number(e.target.value), maxPrice - PRICE_STEP));
                  setPage(1);
                }}
                className="dual-range absolute inset-0 h-5 w-full"
              />
              <input
                type="range"
                aria-label="Prix maximum"
                min={bounds.lo}
                max={bounds.hi}
                step={PRICE_STEP}
                value={maxPrice}
                disabled={sliderDisabled}
                onChange={(e) => {
                  setMaxPrice(Math.max(Number(e.target.value), minPrice + PRICE_STEP));
                  setPage(1);
                }}
                className="dual-range absolute inset-0 h-5 w-full"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-ink-soft">
              <span>{formatNumber(minPrice)}</span>
              <span>{formatNumber(maxPrice)}</span>
            </div>
          </fieldset>

          <fieldset className="mt-5 border-t border-border-egbm/70 pt-4">
            <legend className="font-display font-bold">Disponibilité</legend>
            <div className="mt-2 flex flex-col gap-1.5">
              <button
                type="button"
                aria-pressed={showInStock}
                onClick={() => {
                  setShowInStock((v) => !v);
                  setPage(1);
                }}
                className="flex items-center gap-2 py-0.5 text-left text-sm"
              >
                {checkbox(showInStock)} En stock{" "}
                <span className="text-ink-soft">({inStockCount})</span>
              </button>
              <button
                type="button"
                aria-pressed={showOutOfStock}
                onClick={() => {
                  setShowOutOfStock((v) => !v);
                  setPage(1);
                }}
                className="flex items-center gap-2 py-0.5 text-left text-sm"
              >
                {checkbox(showOutOfStock)} Rupture de stock{" "}
                <span className="text-ink-soft">({outOfStockCount})</span>
              </button>
            </div>
          </fieldset>

          <div className="mt-5 rounded-lg bg-surface p-4">
            <div className="flex items-start gap-3">
              <Boxes size={26} className="shrink-0 text-rust" strokeWidth={1.6} />
              <div>
                <div className="text-sm font-semibold">Besoin d&apos;une grande quantité ?</div>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  Contactez-nous pour une offre personnalisée et un devis rapide.
                </p>
              </div>
            </div>
            <Link
              href="/devis"
              className="mt-3 flex items-center justify-center gap-1.5 rounded-md bg-rust px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
            >
              Demander un devis <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Résultats */}
      <div className="min-w-0">
        <div ref={listTop} className="scroll-mt-24" />
        {query && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-ink-soft">Résultats pour</span>
            <Link
              href="/produits"
              className="flex items-center gap-1.5 rounded-full bg-rust/10 px-3 py-1 font-semibold text-rust"
              aria-label="Effacer la recherche"
            >
              « {query} » <X size={13} />
            </Link>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            <span className="text-rust">{filtered.length}</span>{" "}
            {filtered.length > 1 ? "produits disponibles" : "produit disponible"}
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-md border border-border-egbm bg-white">
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-label="Affichage en grille"
                aria-pressed={view === "grid"}
                className={`px-2.5 py-2 ${view === "grid" ? "bg-rust text-white" : "text-ink"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                aria-label="Affichage en liste"
                aria-pressed={view === "list"}
                className={`px-2.5 py-2 ${view === "list" ? "bg-rust text-white" : "text-ink"}`}
              >
                <List size={16} />
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <span className="hidden sm:inline">Trier par :</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortOption);
                  setPage(1);
                }}
                className="rounded-md border border-border-egbm bg-white px-3 py-2 text-sm font-medium text-ink"
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
                  <option key={s} value={s}>
                    {SORT_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-border-egbm bg-white p-8 text-center">
            <p className="text-sm text-ink-soft">
              {query
                ? "Aucun produit ne correspond à votre recherche."
                : category !== "TOUS" && categoryCounts[category] === 0
                  ? "Pas encore de produits en ligne dans ce secteur. Contactez-nous ou demandez un devis, nous vous répondons rapidement."
                  : "Aucun produit ne correspond à vos filtres."}
            </p>
            {!query && category !== "TOUS" && categoryCounts[category] === 0 && (
              <Link
                href="/devis"
                className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-rust px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
              >
                Demander un devis <ArrowRight size={14} />
              </Link>
            )}
            {filtersActive && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 text-sm font-semibold text-rust hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              view === "grid"
                ? "mt-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3"
                : "mt-5 flex flex-col gap-3"
            }
          >
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} view={view} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Page précédente"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border-egbm bg-white disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {pageNumbers(currentPage, totalPages).map((n, i) =>
              n === "…" ? (
                <span key={`gap-${i}`} className="px-1 text-ink-soft">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  onClick={() => goToPage(n)}
                  aria-current={n === currentPage ? "page" : undefined}
                  className={`h-9 w-9 rounded-md border text-sm font-semibold ${
                    n === currentPage
                      ? "border-rust bg-rust text-white"
                      : "border-border-egbm bg-white text-ink"
                  }`}
                >
                  {n}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label="Page suivante"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border-egbm bg-white disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
