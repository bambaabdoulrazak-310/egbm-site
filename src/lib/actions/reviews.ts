"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { getCustomerSession } from "@/lib/customer-session";
import { notifyNewReview } from "@/lib/notify";

export interface ReviewState {
  error?: string;
  success?: boolean;
}

export async function submitReviewAction(
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const session = await getCustomerSession();
  if (!session) {
    return { error: "Vous devez être connecté pour laisser un avis." };
  }

  const productId = String(formData.get("productId") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim();

  if (!productId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Note invalide." };
  }

  const hasPurchased = await prisma.orderItem.findFirst({
    where: { productId, order: { customerId: session.sub } },
  });
  if (!hasPurchased) {
    return { error: "Vous devez avoir commandé ce produit pour laisser un avis." };
  }

  const existing = await prisma.review.findUnique({
    where: { productId_customerId: { productId, customerId: session.sub } },
  });
  if (existing) {
    return { error: "Vous avez déjà laissé un avis sur ce produit." };
  }

  const [product, customer] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId }, select: { name: true } }),
    prisma.customer.findUnique({ where: { id: session.sub }, select: { name: true } }),
  ]);
  if (!product || !customer) {
    return { error: "Produit introuvable." };
  }

  await prisma.review.create({
    data: { productId, customerId: session.sub, rating, comment: comment || null },
  });

  after(async () => {
    try {
      await notifyNewReview({
        productName: product.name,
        customerName: customer.name,
        rating,
        comment: comment || null,
      });
    } catch (err) {
      console.error("Échec de la notification de nouvel avis :", err);
    }
  });

  revalidatePath(`/produits/${productId}`);
  return { success: true };
}

export async function publishReviewAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const review = await prisma.review.update({
    where: { id },
    data: { published: true },
    select: { productId: true },
  });
  revalidatePath("/espace-entreprise/avis");
  revalidatePath(`/produits/${review.productId}`);
}

export async function unpublishReviewAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const review = await prisma.review.update({
    where: { id },
    data: { published: false },
    select: { productId: true },
  });
  revalidatePath("/espace-entreprise/avis");
  revalidatePath(`/produits/${review.productId}`);
}

export async function deleteReviewAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const review = await prisma.review.delete({ where: { id }, select: { productId: true } });
  revalidatePath("/espace-entreprise/avis");
  revalidatePath(`/produits/${review.productId}`);
}
