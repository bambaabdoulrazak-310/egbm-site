import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS, formatFCFA } from "@/lib/catalog";
import { ProductGallery } from "@/components/site/ProductGallery";
import { AddToCartButton } from "@/components/site/AddToCartButton";

export const revalidate = 0;

async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { media: { orderBy: { order: "asc" } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  return { title: product?.name ?? "Produit" };
}

export default async function ProduitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <Link href="/produits" className="mb-6 flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={16} /> Retour aux produits
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery media={product.media} productName={product.name} />

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-rust">
            {CATEGORY_LABELS[product.category]}
          </div>
          <h1 className="mt-1 font-display text-3xl font-extrabold md:text-4xl">{product.name}</h1>
          <div className="mt-3 font-mono text-2xl font-semibold">{formatFCFA(product.price)}</div>
          <div className="mt-1 text-sm text-ink-soft">
            {product.stock > 0 ? `${product.stock} en stock` : "Rupture de stock"}
          </div>
          {product.description && (
            <p className="mt-4 text-ink-soft">{product.description}</p>
          )}
          <AddToCartButton productId={product.id} disabled={product.stock <= 0} />
        </div>
      </div>
    </div>
  );
}
