import type { Metadata } from "next";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SectorIcon } from "@/components/site/SectorIcon";

export const metadata: Metadata = {
  title: "Réalisations : chantiers et fournitures à Korhogo",
  description:
    "Découvrez les chantiers, livraisons et fournitures réalisés par EGBM à Korhogo et dans sa région : BTP, agro-chimie et matériaux industriels.",
  alternates: { canonical: "/realisations" },
};
export const revalidate = 0;

export default async function RealisationsPage() {
  const realisations = await prisma.realisation.findMany({
    orderBy: { createdAt: "desc" },
    include: { sector: { select: { name: true, icon: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold md:text-5xl">Nos réalisations</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Chantiers, livraisons et fournitures menés par EGBM dans la région de Korhogo : un aperçu
        concret de notre travail pour le BTP, l&apos;agriculture et l&apos;industrie.
      </p>

      {realisations.length === 0 ? (
        <p className="mt-8 text-sm text-ink-soft">Aucune réalisation publiée pour le moment.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {realisations.map((r) => {
            return (
              <div key={r.id} className="overflow-hidden rounded-lg border border-border-egbm bg-cream">
                <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-cement to-ink">
                  {r.photoUrl ? (
                    <Image src={r.photoUrl} alt={r.title} fill className="object-cover" />
                  ) : r.sector ? (
                    <SectorIcon name={r.sector.icon} size={40} className="text-white/80" />
                  ) : (
                    <MapPin size={40} className="text-white/80" />
                  )}
                </div>
                <div className="p-4">
                  {r.sector && (
                    <div className="text-xs font-semibold uppercase tracking-wide text-rust">
                      {r.sector.name}
                    </div>
                  )}
                  <div className="mt-1 font-display text-lg font-bold">{r.title}</div>
                  {r.location && (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
                      <MapPin size={11} /> {r.location}
                    </div>
                  )}
                  <p className="mt-2 text-sm text-ink-soft">{r.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
