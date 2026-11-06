import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { SupplierOrderForm } from "@/components/entreprise/commandes/SupplierOrderForm";

export const metadata: Metadata = { title: "Nouvelle commande fournisseur — Espace Entreprise" };
export const revalidate = 0;

export default async function NewSupplierOrderPage() {
  const session = await requireSession();
  const [products, users] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, unit: true } }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <Link
        href="/espace-entreprise/commandes?onglet=fournisseurs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-rust hover:underline"
      >
        <ArrowLeft size={15} /> Retour aux commandes fournisseurs
      </Link>
      <h1 className="mt-3 font-display text-2xl font-extrabold md:text-4xl">Nouvelle commande fournisseur</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Commande d&apos;approvisionnement : le stock des produits n&apos;augmente qu&apos;à l&apos;enregistrement
        d&apos;une réception.
      </p>
      <SupplierOrderForm products={products} users={users} defaultResponsibleId={session.sub} />
    </div>
  );
}
