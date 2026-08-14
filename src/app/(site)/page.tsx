import Link from "next/link";
import Image from "next/image";
import {
  Award,
  ArrowRight,
  Clock,
  HardHat,
  Leaf,
  MapPin,
  MessageCircle,
  Package,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CATEGORY_ICON, CATEGORY_LABELS, CATEGORY_TEXT_COLOR } from "@/lib/catalog";

export const revalidate = 0;

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

const STRENGTHS = [
  { Icon: MapPin, title: "Proximité", desc: "Implantés à Korhogo, au plus près de vos besoins." },
  { Icon: Award, title: "Qualité", desc: "Des produits sélectionnés avec rigueur pour des résultats durables." },
  { Icon: Clock, title: "Disponibilité", desc: "Stock permanent et livraisons rapides sur tous vos chantiers." },
  { Icon: Users, title: "Conseil", desc: "Une équipe expérimentée à votre écoute pour vous accompagner." },
];

export default async function AccueilPage() {
  const realisations = await prisma.realisation.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div>
      <div className="relative -mx-5 mb-6 h-[420px] overflow-hidden sm:mx-0 sm:rounded-lg md:h-[480px]">
        <Image
          src="/hero-chantier.avif"
          alt="Chantier EGBM"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
        <div className="relative flex h-full flex-col justify-end px-6 pb-8 sm:px-10 sm:pb-10">
          <h1 className="font-display text-4xl font-extrabold leading-[0.95] text-white sm:text-5xl md:text-6xl">
            BÂTIR, CULTIVER,
            <br />
            ÉQUIPER LE NORD.
          </h1>
          <p className="mt-5 max-w-md text-lg text-white/90">
            Depuis Korhogo, EGBM fournit matériaux de construction, intrants agro-chimiques et
            matériaux industriels aux chantiers et exploitations de toute la région.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/produits"
              className="flex items-center gap-2 rounded-md bg-rust px-5 py-3 font-semibold text-white"
            >
              Voir les produits <ArrowRight size={18} />
            </Link>
            <Link
              href="/devis"
              className="rounded-md border-2 border-white px-5 py-3 font-semibold text-white"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-3 gap-2 sm:gap-3">
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

      <section className="mt-16 -mx-5 bg-ink px-5 py-10 text-bg-alt sm:mx-0 sm:rounded-lg">
        <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
          Pourquoi choisir EGBM
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {STRENGTHS.map(({ Icon, title, desc }) => (
            <div key={title}>
              <Icon className="text-safety" size={28} />
              <div className="mt-2 font-display text-lg font-bold text-white">{title}</div>
              <p className="mt-1 text-sm text-bg-alt/80">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {realisations.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Nos réalisations</h2>
            <Link href="/realisations" className="text-sm font-semibold text-rust">
              Voir tout →
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {realisations.map((r) => {
              const Icon = r.category ? CATEGORY_ICON[r.category] : null;
              return (
                <div
                  key={r.id}
                  className="overflow-hidden rounded-lg border border-border-egbm bg-cream"
                >
                  <div className="relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-cement to-ink">
                    {r.photoUrl ? (
                      <Image src={r.photoUrl} alt={r.title} fill className="object-cover" />
                    ) : Icon ? (
                      <Icon size={32} className="text-white/80" />
                    ) : (
                      <MapPin size={32} className="text-white/80" />
                    )}
                  </div>
                  <div className="p-3">
                    {r.category && (
                      <div className={`text-[10px] font-semibold uppercase ${CATEGORY_TEXT_COLOR[r.category]}`}>
                        {CATEGORY_LABELS[r.category]}
                      </div>
                    )}
                    <div className="mt-0.5 font-display font-bold">{r.title}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-16 -mx-5 flex flex-col items-center gap-4 bg-rust px-5 py-8 text-center text-white sm:mx-0 sm:flex-row sm:justify-between sm:rounded-lg sm:text-left">
        <div>
          <div className="font-display text-xl font-bold">
            Besoin de matériaux ou d&apos;un approvisionnement ?
          </div>
          <p className="mt-1 text-sm text-white/90">
            Parlons de votre projet, nous sommes là pour vous accompagner.
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <a
            href="https://wa.me/2250556804286"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-md border-2 border-white px-4 py-2.5 font-semibold"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
          <Link
            href="/devis"
            className="flex items-center gap-1.5 rounded-md bg-white px-4 py-2.5 font-semibold text-rust"
          >
            Demander un devis
          </Link>
        </div>
      </section>
    </div>
  );
}
