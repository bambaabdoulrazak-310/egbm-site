"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { submitReviewAction, type ReviewState } from "@/lib/actions/reviews";

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customerName: string;
}

export type ReviewStatus = "not_logged_in" | "not_eligible" | "can_review" | "pending" | "published";

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= rating ? "fill-safety text-safety" : "text-border-egbm"}
        />
      ))}
    </div>
  );
}

const initialState: ReviewState = {};

function ReviewForm({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState(submitReviewAction, initialState);
  const [rating, setRating] = useState(5);

  if (state.success) {
    return (
      <p className="rounded-md bg-green p-3 text-sm font-semibold text-white">
        Merci, votre avis a été envoyé et sera visible après validation.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} étoiles`}>
            <Star size={22} className={n <= rating ? "fill-safety text-safety" : "text-border-egbm"} />
          </button>
        ))}
      </div>
      <textarea
        name="comment"
        placeholder="Votre avis (optionnel)"
        rows={3}
        className="rounded-md border border-border-egbm bg-white p-3 text-sm"
      />
      {state.error && (
        <p className="text-sm font-medium text-rust-dark" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-rust px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Envoi..." : "Envoyer mon avis"}
      </button>
    </form>
  );
}

export function ProductReviews({
  productId,
  reviews,
  averageRating,
  count,
  status,
}: {
  productId: string;
  reviews: ReviewItem[];
  averageRating: number | null;
  count: number;
  status: ReviewStatus;
}) {
  return (
    <div className="mt-12 border-t border-border-egbm pt-8">
      <h2 className="font-display text-2xl font-bold">Avis clients</h2>

      {count > 0 ? (
        <div className="mt-2 flex items-center gap-2">
          <Stars rating={Math.round(averageRating ?? 0)} />
          <span className="text-sm text-ink-soft">
            {averageRating?.toFixed(1)} / 5 ({count} avis)
          </span>
        </div>
      ) : (
        <p className="mt-2 text-sm text-ink-soft">Aucun avis pour le moment.</p>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-lg border border-border-egbm bg-cream p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{r.customerName}</span>
              <Stars rating={r.rating} size={14} />
            </div>
            {r.comment && <p className="mt-1 text-sm text-ink-soft">{r.comment}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6">
        {status === "can_review" && <ReviewForm productId={productId} />}
        {status === "pending" && (
          <p className="text-sm text-ink-soft">Votre avis est en attente de validation.</p>
        )}
        {status === "published" && (
          <p className="text-sm text-ink-soft">Vous avez déjà laissé un avis sur ce produit.</p>
        )}
        {status === "not_eligible" && (
          <p className="text-sm text-ink-soft">
            Seuls les clients ayant déjà commandé ce produit peuvent laisser un avis.
          </p>
        )}
        {status === "not_logged_in" && (
          <p className="text-sm text-ink-soft">
            <Link href="/compte/connexion" className="font-semibold text-rust hover:underline">
              Connectez-vous
            </Link>{" "}
            pour laisser un avis sur ce produit que vous avez commandé.
          </p>
        )}
      </div>
    </div>
  );
}
