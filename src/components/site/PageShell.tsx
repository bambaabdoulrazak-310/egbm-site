"use client";

import { usePathname } from "next/navigation";

// Page d'accueil : pleine largeur (chaque section gère son propre conteneur).
// Autres pages : conteneur centré standard.
export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <main
      className={pathname === "/" ? "flex-1" : "mx-auto w-full max-w-6xl flex-1 px-5 py-10"}
    >
      {children}
    </main>
  );
}
