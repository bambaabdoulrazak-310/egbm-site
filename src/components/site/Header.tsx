"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { useCart } from "@/components/site/CartProvider";

const NAV_ITEMS: Array<[href: string, label: string]> = [
  ["/", "Accueil"],
  ["/produits", "Produits"],
  ["/services", "Services"],
  ["/realisations", "Réalisations"],
  ["/publications", "Publications"],
  ["/contact", "Contact"],
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border-egbm/60 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo.jpg"
            alt="Logo EGBM"
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
          <span className="leading-none">
            <span className="block font-display text-2xl font-extrabold tracking-wide text-ink">
              EGBM
            </span>
            <span className="mt-1 hidden whitespace-nowrap text-[11px] text-ink-soft sm:block lg:hidden xl:block">
              Construire votre avenir
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-5 text-sm font-medium lg:flex xl:gap-7"
        >
          {NAV_ITEMS.map(([href, label]) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`border-b-2 py-1.5 transition-colors hover:text-rust ${
                  active ? "border-rust text-rust" : "border-transparent text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <form
            action="/produits"
            method="get"
            role="search"
            className="relative hidden xl:block"
          >
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
            />
            <input
              type="search"
              name="q"
              aria-label="Rechercher un produit"
              placeholder="Rechercher un produit…"
              className="w-52 rounded-md border border-border-egbm bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-rust"
            />
          </form>
          <Link
            href="/produits"
            aria-label="Rechercher un produit"
            className="text-ink transition-colors hover:text-rust xl:hidden"
          >
            <Search size={20} />
          </Link>
          <Link
            href="/compte"
            aria-label="Mon compte"
            className="text-ink transition-colors hover:text-rust"
          >
            <User size={20} />
          </Link>
          <Link
            href="/commande"
            aria-label="Mon panier"
            className="relative text-ink transition-colors hover:text-rust"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rust px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
          <Link
            href="/devis"
            className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md bg-rust px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rust-dark md:flex"
          >
            Demander un devis <ArrowRight size={15} />
          </Link>

          <button
            className="text-ink lg:hidden"
            onClick={() => setNavOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={navOpen}
          >
            {navOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {navOpen && (
        <div className="flex flex-col gap-1 border-t border-border-egbm/60 bg-white px-5 pb-4 pt-2 font-medium lg:hidden">
          {NAV_ITEMS.map(([href, label]) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setNavOpen(false)}
                className={`rounded-md px-3 py-2.5 ${
                  active ? "bg-rust/10 text-rust" : "text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/commande"
            onClick={() => setNavOpen(false)}
            className="rounded-md px-3 py-2.5 text-ink"
          >
            Ma commande
          </Link>
          <Link
            href="/devis"
            onClick={() => setNavOpen(false)}
            className="mt-2 flex items-center justify-center gap-1.5 rounded-md bg-rust px-4 py-3 font-semibold text-white"
          >
            Demander un devis <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </header>
  );
}
