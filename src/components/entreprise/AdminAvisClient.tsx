"use client";

import { Star, Trash2 } from "lucide-react";
import {
  deleteReviewAction,
  publishReviewAction,
  unpublishReviewAction,
} from "@/lib/actions/reviews";

export interface AdminReview {
  id: string;
  rating: number;
  comment: string | null;
  published: boolean;
  createdAt: Date;
  product: { name: string };
  customer: { name: string };
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} className={n <= rating ? "fill-safety text-safety" : "text-border-egbm"} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: AdminReview }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border-egbm bg-white shadow-sm p-4">
      <div>
        <div className="font-semibold">{review.product.name}</div>
        <div className="text-xs text-ink-soft">
          {review.customer.name} · {review.createdAt.toISOString().slice(0, 10)}
        </div>
        <div className="mt-1">
          <Stars rating={review.rating} />
        </div>
        {review.comment && <div className="mt-1 text-sm">{review.comment}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {review.published ? (
          <form action={unpublishReviewAction}>
            <input type="hidden" name="id" value={review.id} />
            <button
              type="submit"
              className="rounded-md border border-border-egbm px-3 py-1.5 text-xs font-semibold"
            >
              Dépublier
            </button>
          </form>
        ) : (
          <form action={publishReviewAction}>
            <input type="hidden" name="id" value={review.id} />
            <button type="submit" className="rounded-md bg-rust hover:bg-rust-dark px-3 py-1.5 text-xs font-semibold text-white">
              Publier
            </button>
          </form>
        )}
        <form action={deleteReviewAction}>
          <input type="hidden" name="id" value={review.id} />
          <button type="submit" aria-label="Supprimer">
            <Trash2 size={16} className="text-rust" />
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminAvisClient({ reviews }: { reviews: AdminReview[] }) {
  const pending = reviews.filter((r) => !r.published);
  const published = reviews.filter((r) => r.published);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold md:text-4xl">Avis clients</h1>

      <section className="mt-5">
        <h2 className="font-display text-xl font-bold">En attente de validation</h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">Aucun avis en attente.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {pending.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Publiés</h2>
        {published.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">Aucun avis publié pour le moment.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {published.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
