"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/components/site/CartProvider";

const NAV_ITEMS: Array<[href: string, label: string]> = [
  ["/", "Accueil"],
  ["/produits", "Produits"],
  ["/services", "Services"],
  ["/realisations", "Réalisations"],
  ["/publications", "Publications"],
  ["/commande", "Commande"],
  ["/contact", "Contact"],
];

export function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <header className="bg-rust text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="Logo EGBM"
            width={40}
            height={40}
            className="rounded-full border-2 border-white object-cover"
          />
          <span className="font-display text-2xl font-extrabold tracking-wide">EGBM</span>
        </Link>

        <nav className="hidden items-center gap-3 font-display text-base font-bold md:flex lg:gap-6">
          {NAV_ITEMS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="border-b-2 pb-1 uppercase tracking-wide transition-colors"
              style={{
                borderColor: pathname === href ? "#F0A81C" : "transparent",
                opacity: pathname === href ? 1 : 0.85,
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/devis"
            className="hidden rounded-md bg-white px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-rust md:block"
          >
            Demander un devis
          </Link>
          <Link href="/commande" className="relative">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-safety text-[10px] text-ink">
                {totalItems}
              </span>
            )}
          </Link>

          <button className="md:hidden" onClick={() => setNavOpen((o) => !o)} aria-label="Menu">
            {navOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {navOpen && (
        <div className="flex flex-col gap-2 px-5 pb-4 font-display text-lg font-bold md:hidden">
          {NAV_ITEMS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setNavOpen(false)}
              className="text-left uppercase"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/devis"
            onClick={() => setNavOpen(false)}
            className="mt-2 rounded-md bg-white px-4 py-2 text-center uppercase text-rust"
          >
            Demander un devis
          </Link>
        </div>
      )}
    </header>
  );
}
