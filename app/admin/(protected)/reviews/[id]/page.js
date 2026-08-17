import { notFound } from "next/navigation";
import { getReview } from "@/lib/reviews";
import DetailField from "@/components/DetailField";

export const dynamic = "force-dynamic";

export default async function AdminReviewDetailPage({ params }) {
  const { id } = await params;
  const review = await getReview(id);

  if (!review) {
    notFound();
  }

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">{review.platform_name}</h1>
          <div className="flex gap-2">
            <a
              href={`/admin/reviews/${review.id}/edit`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              Edit
            </a>
            <a
              href="/admin/reviews"
              className="self-center text-sm font-medium text-muted hover:underline"
            >
              &larr; Back to reviews
            </a>
          </div>
        </div>

        {review.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.logo}
            alt=""
            className="mt-6 h-24 w-32 rounded-lg border border-border bg-surface-alt object-contain p-3"
          />
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailField label="Rating" value={review.rating ? `${review.rating} / 5` : null} />
          <DetailField label="Review count" value={review.review_count} />
          <DetailField label="Display order" value={review.display_order} />
          <DetailField
            label="Link to platform"
            value={
              review.url ? (
                <a href={review.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  {review.url}
                </a>
              ) : null
            }
          />
        </div>

        <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
          Added {new Date(review.created_at).toLocaleString()} · Updated{" "}
          {new Date(review.updated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
