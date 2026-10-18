import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ClipboardList,
  Clock,
  FileText,
  Handshake,
  BookOpen,
  HardHat,
  Leaf,
  MapPin,
  Package,
  Pickaxe,
  ShieldCheck,
  Truck,
  UserCheck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ProductCategory } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { CATEGORY_ICON, CATEGORY_LABELS, CATEGORY_TEXT_COLOR } from "@/lib/catalog";
import { COMPANY, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/site/JsonLd";

export const revalidate = 0;

export const metadata: Metadata = {
  title: { absolute: "EGBM — Matériaux de construction, agro-chimie et matériaux industriels à Korhogo" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const PROMISES = [
  { Icon: HardHat, title: "Proximité", desc: "Implantés à Korhogo, au plus près de vos chantiers." },
  {
    Icon: ShieldCheck,
    title: "Qualité",
    desc: "Des produits sélectionnés avec rigueur pour des résultats durables.",
  },
  {
    Icon: Clock,
    title: "Disponibilité",
    desc: "Stock permanent et livraisons rapides sur vos chantiers.",
  },
  { Icon: Users, title: "Conseil", desc: "Une équipe expérimentée à votre écoute." },
];

// photo: null = visuel provisoire (dégradé + icône) en attendant une vraie photo.
const SECTORS: Array<{
  code: ProductCategory;
  title: string;
  Icon: LucideIcon;
  photo: string | null;
  alt: string;
  desc: string;
}> = [
  {
    code: "BTP",
    title: "BTP",
    Icon: HardHat,
    photo: "/btp-chantier.jpg",
    alt: "Bâtiment en construction avec grue sur un chantier BTP",
    desc: "Matériaux de construction, équipements et accompagnement de vos chantiers.",
  },
  {
    code: "AGRO_CHIMIQUE",
    title: "Agro-chimie",
    Icon: Leaf,
    photo: "/agrochimie-secteur.webp",
    alt: "Semences et engrais déposés dans un champ cultivé",
    desc: "Semences, engrais et intrants agricoles pour une meilleure productivité.",
  },
  {
    code: "MATERIAUX_INDUSTRIELS",
    title: "Matériaux industriels",
    Icon: Package,
    photo: "/materiaux-industriels-secteur.jpg",
    alt: "Barres de fer à béton empilées",
    desc: "Acier, fer, ciment et autres matériaux pour vos projets.",
  },
  {
    code: "EQUIPEMENTS_MINIERS",
    title: "Équipements miniers",
    Icon: Pickaxe,
    photo: "/equipements-miniers.jpg",
    alt: "Camion de chantier minier jaune dans une mine à ciel ouvert au coucher du soleil",
    desc: "Matériels et équipements pour les sites miniers.",
  },
  {
    code: "CATALOGUES",
    title: "Catalogues",
    Icon: BookOpen,
    photo: null,
    alt: "",
    desc: "Parcourez l'ensemble de nos produits et demandez un devis pour la référence qu'il vous faut.",
  },
  {
    code: "AUTRES_SERVICES",
    title: "Autres services",
    Icon: Wrench,
    photo: null,
    alt: "",
    desc: "Un besoin spécifique ? Contactez-nous, nous étudions votre demande.",
  },
];

type PhotoSector = (typeof SECTORS)[number] & { photo: string };
const PHOTO_SECTORS = SECTORS.filter((s): s is PhotoSector => s.photo !== null);
const COMPACT_SECTORS = SECTORS.filter((s) => s.photo === null);
// Les cartes photo occupent 2 colonnes sur 6 : les cartes compactes prennent le reste de la ligne.
const COMPACT_COLS = 6 - (PHOTO_SECTORS.length % 3) * 2 || 6;
const COMPACT_WRAPPER_CLASS: Record<number, string> = {
  2: "md:col-span-2",
  4: "md:col-span-4",
  6: "md:col-span-6",
};

function SectorLink({ code }: { code: ProductCategory }) {
  return (
    <Link
      href={`/produits?categorie=${code}`}
      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-rust hover:underline"
    >
      En savoir plus <ArrowRight size={14} />
    </Link>
  );
}

const REASONS = [
  {
    Icon: UserCheck,
    title: "Un interlocuteur unique",
    desc: "Un seul contact, du devis à la livraison, pour gagner du temps.",
  },
  {
    Icon: FileText,
    title: "Devis et proforma rapides",
    desc: "Recevez un devis ou une proforma détaillé pour préparer votre budget.",
  },
  {
    Icon: Truck,
    title: "Livraison sur vos chantiers",
    desc: "Vos commandes livrées directement sur site, dans la région.",
  },
  {
    Icon: ClipboardList,
    title: "Suivi de commande en ligne",
    desc: "Créez votre compte et suivez l'état de vos commandes à tout moment.",
  },
];

export default async function AccueilPage() {
  const [realisations, productCount] = await Promise.all([
    prisma.realisation.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.product.count(),
  ]);

  const stats: Array<[string, string]> = [
    [String(SECTORS.length), "secteurs d'activité"],
    [String(productCount), productCount > 1 ? "produits référencés" : "produit référencé"],
    ["24/7", "assistance & conseil"],
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: SITE_NAME,
          legalName: COMPANY.legalName,
          alternateName: COMPANY.shortName,
          url: SITE_URL,
          logo: `${SITE_URL}/logo.jpg`,
          image: `${SITE_URL}/logo.jpg`,
          description: SITE_DESCRIPTION,
          email: COMPANY.email,
          telephone: COMPANY.phones,
          address: {
            "@type": "PostalAddress",
            addressLocality: COMPANY.city,
            addressCountry: COMPANY.country,
          },
          areaServed: "Korhogo et sa région",
          sameAs: [COMPANY.facebookUrl],
        }}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-night">
        <Image
          src="/hero-chantier.avif"
          alt="Chantier de construction en cours à Korhogo"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/55 md:to-night/25" />
        <div className="relative mx-auto flex min-h-[440px] max-w-6xl flex-col justify-center px-5 py-16 md:min-h-[520px]">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">
            EGBM — Entreprise Générale Bamba Mamadou
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl">
            Votre partenaire de confiance pour vos{" "}
            <span className="text-rust">projets de construction</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 md:text-lg">
            Matériaux de construction, intrants agricoles et équipements industriels : EGBM
            accompagne les professionnels du nord de la Côte d&apos;Ivoire, du gros œuvre aux
            finitions.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="flex items-center gap-2 rounded-md bg-rust px-6 py-3 font-semibold text-white transition-colors hover:bg-rust-dark"
            >
              Découvrir nos services <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="rounded-md border border-white/80 px-6 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-night"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* Engagements */}
      <section className="bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-5 py-10 md:grid-cols-4">
          {PROMISES.map(({ Icon, title, desc }, i) => (
            <div
              key={title}
              className={`px-3 md:px-8 ${i > 0 ? "md:border-l md:border-border-egbm" : "md:pl-0"}`}
            >
              <Icon className="text-rust" size={30} strokeWidth={1.6} />
              <h2 className="mt-3 font-display text-lg font-bold text-ink">{title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Secteurs */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-3 h-0.5 w-10 bg-rust" />
            <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
              Nos secteurs d&apos;activité
            </h2>
          </div>
          <Link
            href="/produits"
            className="flex items-center gap-1.5 text-sm font-semibold text-rust hover:underline"
          >
            Découvrir tous nos secteurs <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-6">
          {PHOTO_SECTORS.map(({ code, title, Icon, photo, alt, desc }) => (
            <article
              key={code}
              className="overflow-hidden rounded-lg border border-border-egbm bg-white shadow-sm md:col-span-2"
            >
              <div className="relative h-48">
                <Image
                  src={photo}
                  alt={alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <Icon className="text-rust" size={26} strokeWidth={1.6} />
                  <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{desc}</p>
                <SectorLink code={code} />
              </div>
            </article>
          ))}

          {/* Secteurs sans photo : cartes compactes (icône + texte), qui remplissent la
              place restante de la dernière ligne, empilées à côté de la dernière photo. */}
          {COMPACT_SECTORS.length > 0 && (
            <div
              className={`flex flex-col gap-5 ${COMPACT_WRAPPER_CLASS[COMPACT_COLS]} ${
                COMPACT_COLS === 6 ? "md:flex-row" : ""
              }`}
            >
              {COMPACT_SECTORS.map(({ code, title, Icon, desc }) => (
                <article
                  key={code}
                  className="flex items-start gap-4 rounded-lg border border-border-egbm bg-white p-5 shadow-sm md:flex-1"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-rust/10">
                    <Icon className="text-rust" size={26} strokeWidth={1.6} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{desc}</p>
                    <SectorLink code={code} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pourquoi choisir EGBM */}
      <section className="relative isolate overflow-hidden bg-night text-white">
        <Image
          src="/hero-chantier.avif"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-10"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[1fr_2.3fr] lg:items-center">
          <div>
            <div className="mb-3 h-0.5 w-10 bg-rust" />
            <h2 className="font-display text-3xl font-bold md:text-4xl">Pourquoi choisir EGBM ?</h2>
            <p className="mt-4 max-w-sm leading-relaxed text-white/80">
              Une expertise locale, des produits de qualité et un accompagnement sur mesure pour
              la réussite de vos projets.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map(({ Icon, title, desc }, i) => (
              <div
                key={title}
                className={`lg:px-5 ${i > 0 ? "lg:border-l lg:border-white/15" : ""}`}
              >
                <Icon className="text-rust" size={30} strokeWidth={1.6} />
                <h3 className="mt-3 font-display text-lg font-bold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/75">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chiffres */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-3 px-5 py-10">
          {stats.map(([n, label], i) => (
            <div
              key={label}
              className={`px-2 text-center sm:px-6 ${i > 0 ? "border-l border-border-egbm" : ""}`}
            >
              <div className="font-display text-3xl font-extrabold text-rust sm:text-5xl">{n}</div>
              <div className="mt-1 text-xs text-ink-soft sm:text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Réalisations (gérées depuis l'espace entreprise) */}
      {realisations.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="mb-3 h-0.5 w-10 bg-rust" />
              <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
                Nos réalisations
              </h2>
            </div>
            <Link
              href="/realisations"
              className="flex items-center gap-1.5 text-sm font-semibold text-rust hover:underline"
            >
              Voir toutes nos réalisations <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-4">
            {realisations.map((r) => {
              const Icon = r.category ? CATEGORY_ICON[r.category] : null;
              return (
                <article
                  key={r.id}
                  className="overflow-hidden rounded-lg border border-border-egbm bg-white shadow-sm"
                >
                  <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-cement to-night">
                    {r.photoUrl ? (
                      <Image
                        src={r.photoUrl}
                        alt={r.title}
                        fill
                        sizes="(min-width: 768px) 25vw, 50vw"
                        className="object-cover"
                      />
                    ) : Icon ? (
                      <Icon size={32} className="text-white/80" />
                    ) : (
                      <MapPin size={32} className="text-white/80" />
                    )}
                  </div>
                  <div className="p-4">
                    {r.category && (
                      <div
                        className={`text-[10px] font-semibold uppercase tracking-wide ${CATEGORY_TEXT_COLOR[r.category]}`}
                      >
                        {CATEGORY_LABELS[r.category]}
                      </div>
                    )}
                    <h3 className="mt-0.5 font-display font-bold text-ink">{r.title}</h3>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Appel à l'action */}
      <section className="relative isolate overflow-hidden bg-surface">
        <Image
          src="/btp-chantier.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-right opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-surface/10" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-12 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-5 border-l-2 border-rust pl-5">
            <Handshake className="hidden shrink-0 text-ink sm:block" size={40} strokeWidth={1.4} />
            <div>
              <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
                Un besoin pour votre chantier ou votre exploitation ?
              </h2>
              <p className="mt-1 text-ink-soft">
                Notre équipe est à votre écoute pour vous accompagner.
              </p>
            </div>
          </div>
          <a
            href={COMPANY.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex shrink-0 items-center gap-2 rounded-md bg-rust px-6 py-3 font-semibold text-white transition-colors hover:bg-rust-dark"
          >
            Parler à notre équipe <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </div>
  );
}
