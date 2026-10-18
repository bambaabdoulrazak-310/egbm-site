import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProduitsClient } from "@/components/site/ProduitsClient";

export const metadata: Metadata = {
  title: "Produits : matériaux de construction, agro-chimie et fer à Korhogo",
  description:
    "Catalogue EGBM : ciment, fer à béton, tôles, contreplaqué, engrais et produits agro-chimiques. Prix en FCFA et commande en ligne à Korhogo.",
  alternates: { canonical: "/produits" },
};
export const revalidate = 0;

const NEW_PRODUCT_DAYS = 30;
const TOP_SELLERS_COUNT = 3;

function isRecent(date: Date) {
  return Date.now() - date.getTime() < NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000;
}

const FAMILIES = [
  {
    title: "BTP",
    text: "Tout ce qu'il faut pour vos chantiers de construction : matériaux de gros œuvre et équipements pour mener vos projets du terrassement aux finitions.",
  },
  {
    title: "Agro-chimie",
    text: "Engrais, herbicides et insecticides pour protéger vos cultures et améliorer vos rendements, adaptés aux exploitations de la région de Korhogo.",
  },
  {
    title: "Matériaux industriels",
    text: "Fer, tôles, contreplaqué, fil de fer et autres matériaux pour vos ateliers, vos structures et vos aménagements.",
  },
  {
    title: "Équipements miniers",
    text: "Matériels et équipements pour les sites miniers. Contactez-nous pour connaître les références disponibles.",
  },
  {
    title: "Autres services & catalogue",
    text: "Vous ne trouvez pas ce que vous cherchez ? Parcourez notre catalogue ou contactez-nous pour un besoin spécifique.",
  },
];

export default async function ProduitsPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string; q?: string }>;
}) {
  const { categorie, q } = await searchParams;
  const rows = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      stock: true,
      sold: true,
      createdAt: true,
      media: { orderBy: { order: "asc" }, take: 1 },
    },
  });

  // Pastilles calculées à partir des données réelles : jamais inventées.
  const topSellerIds = new Set(
    [...rows]
      .filter((p) => p.sold > 0)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, TOP_SELLERS_COUNT)
      .map((p) => p.id)
  );
  const products = rows.map(({ createdAt, ...p }) => ({
    ...p,
    createdAt: createdAt.getTime(),
    isNew: isRecent(createdAt),
    topSeller: topSellerIds.has(p.id),
  }));

  const query = (q ?? "").trim();

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-forest">
        <Image
          src="/btp-chantier.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/90 to-forest/35" />
        <div className="relative mx-auto max-w-6xl px-5 py-10 md:py-12">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-xs text-white/80">
            <Link href="/" className="hover:text-white">
              Accueil
            </Link>
            <ChevronRight size={12} />
            <span className="text-white">Produits</span>
          </nav>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-white md:text-6xl">
            Nos <span className="text-rust">produits</span>
          </h1>
          <p className="mt-3 max-w-xl leading-relaxed text-white/85 md:text-lg">
            Des matériaux de qualité pour tous vos projets de construction, d&apos;agro-industrie
            et d&apos;infrastructures.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <ProduitsClient
          key={`${categorie ?? ""}|${query}`}
          products={products}
          initialCategory={categorie}
          initialQuery={query}
        />

        <section className="mt-14 border-t border-border-egbm pt-10">
          <h2 className="font-display text-2xl font-bold">Nos familles de produits</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {FAMILIES.map((f) => (
              <div key={f.title}>
                <h3 className="font-display text-lg font-bold text-rust">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
