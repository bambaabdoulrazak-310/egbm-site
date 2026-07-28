import type { Metadata } from "next";
import { HardHat, Leaf, Package, Truck } from "lucide-react";

export const metadata: Metadata = { title: "Services" };

const SERVICES = [
  {
    icon: HardHat,
    title: "Travaux de génie civil",
    desc: "Construction, terrassement, voirie et ouvrages BTP pour particuliers et institutions.",
  },
  {
    icon: Leaf,
    title: "Distribution agro-chimique",
    desc: "Engrais, herbicides et insecticides pour l'agriculture de la région de Korhogo.",
  },
  {
    icon: Package,
    title: "Fourniture de matériaux industriels",
    desc: "Tôles, contreplaqué, fil de fer et autres intrants pour vos chantiers et ateliers.",
  },
  {
    icon: Truck,
    title: "Livraison sur chantier",
    desc: "Transport et livraison des commandes directement sur site, dans la région.",
  },
];

export default function ServicesPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold md:text-5xl">Services</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {SERVICES.map((s) => (
          <div
            key={s.title}
            className="flex gap-4 rounded-lg border border-border-egbm bg-cream p-5"
          >
            <s.icon size={28} className="shrink-0 text-rust" />
            <div>
              <div className="font-display text-xl font-bold">{s.title}</div>
              <div className="mt-1 text-sm text-ink-soft">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
