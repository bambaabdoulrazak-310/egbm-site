import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, ExternalLink, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFileSize } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Catalogues : téléchargez nos catalogues PDF",
  description:
    "Consultez et téléchargez les catalogues PDF d'EGBM à Korhogo : matériaux de construction, agro-chimie, équipements miniers et matériaux industriels.",
  alternates: { canonical: "/catalogues" },
};
export const revalidate = 0;

function downloadUrl(url: string) {
  return `${url}${url.includes("?") ? "&" : "?"}download=1`;
}

export default async function CataloguesPage() {
  const catalogues = await prisma.catalogue.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold md:text-5xl">Nos catalogues</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
        Consultez ou téléchargez nos catalogues au format PDF. Pour un prix, une disponibilité ou
        une référence précise, demandez-nous un devis : nous vous répondons rapidement.
      </p>

      {catalogues.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border-egbm bg-white p-8 text-center">
          <p className="text-sm text-ink-soft">
            Aucun catalogue n&apos;est disponible pour le moment. Contactez-nous ou demandez un
            devis pour recevoir notre documentation.
          </p>
          <Link
            href="/devis"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-rust px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
          >
            Demander un devis <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {catalogues.map((c) => (
            <article
              key={c.id}
              className="flex flex-col overflow-hidden rounded-lg border border-border-egbm bg-white shadow-sm"
            >
              <a
                href={c.fileUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Consulter le catalogue ${c.title}`}
                className="relative block h-52 bg-gradient-to-br from-night to-cement"
              >
                {c.coverUrl ? (
                  <Image
                    src={c.coverUrl}
                    alt={`Couverture du catalogue ${c.title}`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    <FileText size={64} strokeWidth={1.2} className="text-white/70" />
                  </span>
                )}
              </a>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-display text-xl font-bold text-ink">{c.title}</h2>
                {c.description && (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">
                    {c.description}
                  </p>
                )}
                <p className="mt-3 text-xs text-ink-soft">
                  PDF · {formatFileSize(c.fileSize)} ·{" "}
                  {c.createdAt.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <a
                    href={c.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border-egbm px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-rust hover:text-rust"
                  >
                    <ExternalLink size={15} /> Consulter
                  </a>
                  <a
                    href={downloadUrl(c.fileUrl)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-rust px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
                  >
                    <Download size={15} /> Télécharger
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
