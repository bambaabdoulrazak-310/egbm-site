"use client";

import { usePathname } from "next/navigation";

// Pages pleine largeur (accueil, liste des produits) : chaque section gère son
// propre conteneur. Autres pages : conteneur centré standard.
const FULL_WIDTH_PATHS = ["/", "/produits"];

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <main
      className={
        FULL_WIDTH_PATHS.includes(pathname) ? "flex-1" : "mx-auto w-full max-w-6xl flex-1 px-5 py-10"
      }
    >
      {children}
    </main>
  );
}
