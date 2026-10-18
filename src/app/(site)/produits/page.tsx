import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProduitsClient } from "@/components/site/ProduitsClient";

export const metadata: Metadata = {
  title: "Produits : matériaux de construction, agro-chimie et fer à Korhogo",
  description:
    "Catalogue EGBM : ciment, fer à béton, tôles, contreplaqué, engrais et produits agro-chimiques. Prix en FCFA et commande en ligne à Korhogo.",
  alternates: { canonical: "/produits" },
};
export const revalidate = 0;

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
];

export default async function ProduitsPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { categorie } = await searchParams;
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      stock: true,
      media: { orderBy: { order: "asc" }, take: 1 },
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold md:text-5xl">Nos produits</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
        Matériaux de construction, produits agro-chimiques et matériaux industriels : retrouvez
        les prix en FCFA et le stock disponible, ajoutez vos articles au panier et passez commande
        en quelques clics. Besoin de quantités importantes ? Demandez un devis.
      </p>

      <ProduitsClient products={products} initialCategory={categorie} />

      <section className="mt-14 border-t border-border-egbm pt-10">
        <h2 className="font-display text-2xl font-bold">Nos trois familles de produits</h2>
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
  );
}
