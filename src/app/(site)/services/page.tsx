import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HardHat, Leaf, MessageCircle, Package, Truck } from "lucide-react";
import { COMPANY } from "@/lib/site";
import { JsonLd } from "@/components/site/JsonLd";

export const metadata: Metadata = {
  title: "Services : génie civil, agro-chimie et matériaux à Korhogo",
  description:
    "Génie civil, distribution de produits agro-chimiques, fourniture de matériaux industriels et livraison sur chantier à Korhogo et dans sa région.",
  alternates: { canonical: "/services" },
};

const SERVICES = [
  {
    icon: HardHat,
    title: "Travaux de génie civil",
    desc: "Construction, terrassement, voirie et ouvrages BTP pour particuliers, entreprises et institutions. Nous vous accompagnons de la préparation du chantier à sa réalisation.",
  },
  {
    icon: Leaf,
    title: "Distribution agro-chimique",
    desc: "Engrais, herbicides et insecticides pour les exploitations agricoles de la région de Korhogo, avec des conseils pour choisir le produit adapté à vos cultures.",
  },
  {
    icon: Package,
    title: "Fourniture de matériaux industriels",
    desc: "Ciment, fer à béton, tôles, contreplaqué, fil de fer et autres intrants pour vos chantiers et vos ateliers, disponibles en stock.",
  },
  {
    icon: Truck,
    title: "Livraison sur chantier",
    desc: "Transport et livraison de vos commandes directement sur site, dans la région, pour vous éviter les déplacements et les pertes de temps.",
  },
];

const STEPS = [
  {
    title: "Choisissez vos produits ou demandez un devis",
    desc: "Parcourez le catalogue et ajoutez vos articles au panier, ou décrivez votre besoin pour recevoir un devis.",
  },
  {
    title: "Nous confirmons avec vous",
    desc: "Notre équipe vous contacte pour valider les quantités, le prix et les modalités de livraison.",
  },
  {
    title: "Recevez votre commande",
    desc: "Vos matériaux sont livrés sur votre chantier ou votre exploitation.",
  },
];

const FAQ = [
  {
    q: "Comment passer commande ?",
    a: "Ajoutez vos produits au panier depuis la page Produits, puis validez la page Commande avec vos coordonnées. Notre équipe vous contacte ensuite pour confirmer la commande.",
  },
  {
    q: "Comment obtenir un devis ou une proforma ?",
    a: "Remplissez le formulaire de demande de devis en décrivant votre besoin (matériaux, quantités, délais). Nous vous recontactons rapidement avec un devis adapté.",
  },
  {
    q: "Livrez-vous directement sur les chantiers ?",
    a: "Oui, nous livrons les commandes directement sur site, dans la région de Korhogo.",
  },
  {
    q: "Puis-je suivre l'état de ma commande ?",
    a: "Oui. En créant un compte client, vous retrouvez l'historique de vos commandes et leur statut (nouvelle, en cours, livrée).",
  },
];

export default function ServicesPage() {
  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />

      <h1 className="font-display text-3xl font-extrabold md:text-5xl">Nos services</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
        Du chantier à l&apos;exploitation agricole, EGBM vous accompagne de la commande à la
        livraison : travaux de génie civil, distribution de produits agro-chimiques et fourniture
        de matériaux industriels, à Korhogo et dans sa région.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {SERVICES.map((s) => (
          <div
            key={s.title}
            className="flex gap-4 rounded-lg border border-border-egbm bg-white p-5 shadow-sm"
          >
            <s.icon size={28} className="shrink-0 text-rust" strokeWidth={1.6} />
            <div>
              <h2 className="font-display text-xl font-bold">{s.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <div className="mb-3 h-0.5 w-10 bg-rust" />
        <h2 className="font-display text-2xl font-bold md:text-3xl">Comment ça marche</h2>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-lg bg-surface p-5">
              <div className="font-display text-4xl font-extrabold text-rust">{i + 1}</div>
              <h3 className="mt-2 font-display text-lg font-bold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <div className="mb-3 h-0.5 w-10 bg-rust" />
        <h2 className="font-display text-2xl font-bold md:text-3xl">Questions fréquentes</h2>
        <div className="mt-6 flex flex-col gap-3">
          {FAQ.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-lg border border-border-egbm bg-white px-5 py-4 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none font-semibold text-ink marker:content-none">
                <span className="flex items-center justify-between gap-3">
                  {q}
                  <span className="text-rust transition-transform group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-14 flex flex-col items-start gap-4 rounded-lg bg-night p-6 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Un projet en tête ?</h2>
          <p className="mt-1 text-white/80">Parlez-nous de votre besoin, nous revenons vers vous rapidement.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/devis"
            className="flex items-center gap-2 rounded-md bg-rust px-5 py-3 font-semibold text-white transition-colors hover:bg-rust-dark"
          >
            Demander un devis <ArrowRight size={16} />
          </Link>
          <a
            href={COMPANY.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-md border border-white/70 px-5 py-3 font-semibold transition-colors hover:bg-white hover:text-night"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
