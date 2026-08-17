import { getTestimonials } from "@/lib/testimonials";
import { setTestimonialStatusAction, deleteTestimonialAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

const STATUS_BADGE = {
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  Approved: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Rejected: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="w-full max-w-3xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Customer reviews</h1>
        <p className="mt-1 text-sm text-muted">
          Submitted via /leave-a-review. Only approved reviews show on the home page. Set
          display order on a review&apos;s detail page.
        </p>

        {testimonials.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No reviews submitted yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {t.author_name}{" "}
                      <span
                        className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[t.status]}`}
                      >
                        {t.status}
                      </span>
                    </p>
                    <p className="text-sm text-yellow-500">
                      {"★".repeat(t.rating)}
                      <span className="text-gray-300 dark:text-gray-600">
                        {"★".repeat(5 - t.rating)}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-muted">{formatDate(t.created_at)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {t.status !== "Approved" && (
                      <form action={setTestimonialStatusAction}>
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="status" value="Approved" />
                        <button
                          type="submit"
                          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-surface-alt dark:text-green-400"
                        >
                          Approve
                        </button>
                      </form>
                    )}
                    {t.status !== "Rejected" && (
                      <form action={setTestimonialStatusAction}>
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="status" value="Rejected" />
                        <button
                          type="submit"
                          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                        >
                          Reject
                        </button>
                      </form>
                    )}
                    <a
                      href={`/admin/testimonials/${t.id}`}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                    >
                      View
                    </a>
                    <form action={deleteTestimonialAction}>
                      <input type="hidden" name="id" value={t.id} />
                      <DeleteButton
                        confirmMessage={`Delete this review from ${t.author_name}? This can't be undone.`}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-surface-alt dark:text-red-400"
                      />
                    </form>
                  </div>
                </div>
                <p className="mt-3 text-sm text-foreground">{t.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
