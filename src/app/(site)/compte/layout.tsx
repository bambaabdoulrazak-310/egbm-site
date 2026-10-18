import type { Metadata } from "next";

// Espace client privé : ne doit pas apparaître dans les résultats de recherche.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
