import { getReviews } from "@/lib/reviews";
import { deleteReviewAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getReviews();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Reviews</h1>
            <p className="mt-1 text-sm text-muted">
              Third-party rating platforms shown on the home page. Changes appear on the live
              site immediately.
            </p>
          </div>
          <a
            href="/admin/reviews/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add platform
          </a>
        </div>

        {reviews.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No review platforms yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-semibold text-foreground">{review.name}</p>
                  <p className="text-sm text-muted">
                    {review.rating} / 5 · {review.count}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/reviews/${review.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    Edit
                  </a>
                  <form action={deleteReviewAction}>
                    <input type="hidden" name="id" value={review.id} />
                    <DeleteButton
                      confirmMessage={`Delete "${review.name}"? This can't be undone.`}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-surface-alt dark:text-red-400"
                    />
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
