import Link from "next/link";
import { ArrowRight, HardHat, Leaf, Package } from "lucide-react";
import { Stamp } from "@/components/site/Stamp";

const SECTORS = [
  { cat: "BTP", Icon: HardHat, color: "bg-rust" },
  { cat: "Agro-chimique", Icon: Leaf, color: "bg-green" },
  { cat: "Matériaux industriels", Icon: Package, color: "bg-cement" },
] as const;

const STATS: Array<[string, string]> = [
  ["3", "secteurs d'activité"],
  ["9+", "produits référencés"],
  ["24/7", "livraison chantier"],
];

export default function AccueilPage() {
  return (
    <div>
      <div className="mb-8 h-56 overflow-hidden rounded-lg border border-border-egbm bg-gradient-to-br from-rust to-rust-dark md:h-72">
        <div className="flex h-full items-center px-8">
          <span className="font-display text-6xl font-extrabold text-white/90 md:text-8xl">
            EGBM
          </span>
        </div>
      </div>

      <section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <Stamp />
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[0.95] sm:text-5xl md:text-6xl">
            BÂTIR, CULTIVER,
            <br />
            ÉQUIPER LE NORD.
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-soft">
            Depuis Korhogo, EGBM fournit matériaux de construction, intrants agro-chimiques et
            matériaux industriels aux chantiers et exploitations de toute la région.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/produits"
              className="flex items-center gap-2 rounded-md bg-rust px-5 py-3 font-semibold text-white"
            >
              Voir les produits <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="rounded-md border-2 border-ink px-5 py-3 font-semibold"
            >
              Nous contacter
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {STATS.map(([n, l]) => (
            <div
              key={l}
              className="rounded-lg border border-border-egbm bg-cream p-2.5 text-center sm:p-4"
            >
              <div className="font-display text-xl font-extrabold text-rust sm:text-3xl md:text-4xl">
                {n}
              </div>
              <div className="mt-1 text-[10px] text-ink-soft sm:text-xs">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Nos secteurs</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {SECTORS.map(({ cat, Icon, color }) => (
            <div
              key={cat}
              className="overflow-hidden rounded-lg border border-border-egbm bg-cream"
            >
              <div className={`flex h-36 items-center justify-center ${color}`}>
                <Icon size={56} className="text-white/90" />
              </div>
              <div className="p-4">
                <Icon className="text-ink-soft" size={24} />
                <div className="mt-2 font-display text-xl font-bold">{cat}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
