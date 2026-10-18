import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/catalog";
import { ProductGallery } from "@/components/site/ProductGallery";
import { AddToCartButton } from "@/components/site/AddToCartButton";
import { ProductReviews, type ReviewStatus } from "@/components/site/ProductReviews";
import { getCustomerSession } from "@/lib/customer-session";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/site/JsonLd";

export const revalidate = 0;

async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { media: { orderBy: { order: "asc" } }, sector: { select: { name: true } } },
  });
}

// Description saisie par l'équipe, sinon un texte de repli factuel.
function describeProduct(p: NonNullable<Awaited<ReturnType<typeof getProduct>>>) {
  return (
    p.description?.trim() ||
    `${p.name} — ${p.sector.name} disponible chez EGBM à Korhogo. Prix : ${formatFCFA(p.price)}. Commande en ligne ou demande de devis.`
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Produit" };

  const description = describeProduct(product).slice(0, 155);
  const cover = product.media.find((m) => m.type === "IMAGE");
  return {
    title: `${product.name} à Korhogo`,
    description,
    alternates: { canonical: `/produits/${id}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      images: cover ? [{ url: cover.url, alt: product.name }] : undefined,
    },
  };
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

  const customerSession = await getCustomerSession();

  const [publishedReviews, aggregate, myReview, purchased] = await Promise.all([
    prisma.review.findMany({
      where: { productId: id, published: true },
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } } },
    }),
    prisma.review.aggregate({
      where: { productId: id, published: true },
      _avg: { rating: true },
      _count: true,
    }),
    customerSession
      ? prisma.review.findUnique({
          where: { productId_customerId: { productId: id, customerId: customerSession.sub } },
        })
      : null,
    customerSession
      ? prisma.orderItem.findFirst({
          where: { productId: id, order: { customerId: customerSession.sub } },
        })
      : null,
  ]);

  let reviewStatus: ReviewStatus = "not_logged_in";
  if (customerSession) {
    if (myReview) {
      reviewStatus = myReview.published ? "published" : "pending";
    } else if (!purchased) {
      reviewStatus = "not_eligible";
    } else {
      reviewStatus = "can_review";
    }
  }

  const images = product.media.filter((m) => m.type === "IMAGE").map((m) => m.url);

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: describeProduct(product),
          category: product.sector.name,
          ...(images.length > 0 ? { image: images } : {}),
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/produits/${product.id}`,
            priceCurrency: "XOF",
            price: product.price,
            availability:
              product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: SITE_NAME },
          },
          // Note moyenne uniquement si des avis publiés existent réellement.
          ...(aggregate._count > 0 && aggregate._avg.rating
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: Number(aggregate._avg.rating.toFixed(1)),
                  reviewCount: aggregate._count,
                },
              }
            : {}),
        }}
      />
      <Link href="/produits" className="mb-6 flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={16} /> Retour aux produits
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery media={product.media} productName={product.name} />

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-rust">
            {product.sector.name}
          </div>
          <h1 className="mt-1 font-display text-3xl font-extrabold md:text-4xl">{product.name}</h1>
          <div className="mt-3 font-mono text-2xl font-semibold">{formatFCFA(product.price)}</div>
          <div className="mt-1 text-sm text-ink-soft">
            {product.stock > 0 ? `${product.stock} en stock` : "Rupture de stock"}
          </div>
          <p className="mt-4 leading-relaxed text-ink-soft">{describeProduct(product)}</p>
          <AddToCartButton productId={product.id} disabled={product.stock <= 0} />
        </div>
      </div>

      <ProductReviews
        productId={product.id}
        reviews={publishedReviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
          customerName: r.customer.name,
        }))}
        averageRating={aggregate._avg.rating}
        count={aggregate._count}
        status={reviewStatus}
      />
    </div>
  );
}
