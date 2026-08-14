import type { Metadata } from "next";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CATEGORY_ICON, CATEGORY_LABELS, CATEGORY_TEXT_COLOR } from "@/lib/catalog";

export const metadata: Metadata = { title: "Réalisations" };
export const revalidate = 0;

export default async function RealisationsPage() {
  const realisations = await prisma.realisation.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold md:text-5xl">Nos réalisations</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Chantiers, livraisons et fournitures menés par EGBM dans la région de Korhogo.
      </p>

      {realisations.length === 0 ? (
        <p className="mt-8 text-sm text-ink-soft">Aucune réalisation publiée pour le moment.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {realisations.map((r) => {
            const Icon = r.category ? CATEGORY_ICON[r.category] : null;
            return (
              <div key={r.id} className="overflow-hidden rounded-lg border border-border-egbm bg-cream">
                <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-cement to-ink">
                  {r.photoUrl ? (
                    <Image src={r.photoUrl} alt={r.title} fill className="object-cover" />
                  ) : Icon ? (
                    <Icon size={40} className="text-white/80" />
                  ) : (
                    <MapPin size={40} className="text-white/80" />
                  )}
                </div>
                <div className="p-4">
                  {r.category && (
                    <div className={`text-xs font-semibold uppercase tracking-wide ${CATEGORY_TEXT_COLOR[r.category]}`}>
                      {CATEGORY_LABELS[r.category]}
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
