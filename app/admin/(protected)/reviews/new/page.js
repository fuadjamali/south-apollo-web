import ReviewForm from "@/components/ReviewForm";
import { createReviewAction } from "../actions";

export default function NewReviewPage() {
  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add review platform</h1>
        <ReviewForm action={createReviewAction} submitLabel="Create" />
      </div>
    </div>
  );
}
