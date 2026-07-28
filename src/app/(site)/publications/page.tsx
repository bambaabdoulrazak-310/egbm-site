import type { Metadata } from "next";
import { Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Publications & Événements" };
export const revalidate = 0;

export default async function PublicationsPage() {
  const publications = await prisma.publication.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold md:text-5xl">
        Publications &amp; Événements
      </h1>

      {publications.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">Aucune publication pour le moment.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {publications.map((pub) => (
            <div
              key={pub.id}
              className="flex gap-4 rounded-lg border border-border-egbm bg-cream p-5"
            >
              <div
                className={`flex w-16 shrink-0 flex-col items-center justify-center rounded-md ${
                  pub.type === "EVENEMENT" ? "bg-safety" : "bg-bg-alt"
                }`}
              >
                <Calendar size={18} />
                <div className="mt-1 font-mono text-[11px]">
                  {pub.date.toISOString().slice(5, 10)}
                </div>
              </div>
              <div>
                <div
                  className={`text-xs font-semibold uppercase ${
                    pub.type === "EVENEMENT" ? "text-rust" : "text-green"
                  }`}
                >
                  {pub.type === "EVENEMENT" ? "Événement" : "Publication"}
                </div>
                <div className="font-display text-xl font-bold">{pub.title}</div>
                <div className="mt-1 text-sm text-ink-soft">{pub.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
