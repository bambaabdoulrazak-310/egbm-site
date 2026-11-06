import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { ManualOrderForm } from "@/components/entreprise/commandes/ManualOrderForm";

export const metadata: Metadata = { title: "Nouvelle commande — Espace Entreprise" };
export const revalidate = 0;

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const quoteId = (Array.isArray(params.devis) ? params.devis[0] : params.devis) ?? "";

  const [products, users, quote] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, unit: true },
    }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    quoteId ? prisma.quoteRequest.findUnique({ where: { id: quoteId } }) : Promise.resolve(null),
  ]);

  const alreadyConverted = Boolean(quote?.convertedOrderId);

  return (
    <div>
      <Link
        href="/espace-entreprise/commandes"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-rust hover:underline"
      >
        <ArrowLeft size={15} /> Retour au suivi
      </Link>
      <h1 className="mt-3 font-display text-2xl font-extrabold md:text-4xl">
        {quote ? "Convertir la demande de devis en commande" : "Nouvelle commande"}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        La commande est enregistrée comme confirmée. Une demande de devis ne devient une commande que par
        cette conversion explicite.
      </p>

      {alreadyConverted ? (
        <p className="mt-5 rounded-lg border border-border-egbm bg-white p-5 text-sm">
          Cette demande de devis a déjà été convertie en commande.
        </p>
      ) : (
        <ManualOrderForm
          products={products}
          users={users}
          defaultResponsibleId={session.sub}
          quote={
            quote
              ? {
                  id: quote.id,
                  clientName: quote.clientName,
                  clientPhone: quote.clientPhone,
                  clientCompany: quote.clientCompany,
                  message: quote.message,
                }
              : null
          }
        />
      )}
    </div>
  );
}
