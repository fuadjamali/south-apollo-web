import { notFound } from "next/navigation";
import { getReview } from "@/lib/reviews";
import ReviewForm from "@/components/ReviewForm";
import DeleteButton from "@/components/DeleteButton";
import { updateReviewAction, deleteReviewAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditReviewPage({ params }) {
  const { id } = await params;
  const review = await getReview(id);

  if (!review) {
    notFound();
  }

  const boundUpdate = updateReviewAction.bind(null, review.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit review platform</h1>
        <ReviewForm action={boundUpdate} review={review} submitLabel="Save changes" />

        <form action={deleteReviewAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={review.id} />
          <DeleteButton
            confirmMessage={`Delete "${review.platform_name}"? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this platform
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
