import { notFound } from "next/navigation";
import { getTestimonial } from "@/lib/testimonials";
import DetailField from "@/components/DetailField";
import { updateTestimonialAction } from "../actions";

export const dynamic = "force-dynamic";

const STATUSES = ["Pending", "Approved", "Rejected"];

export default async function AdminTestimonialDetailPage({ params }) {
  const { id } = await params;
  const testimonial = await getTestimonial(id);

  if (!testimonial) {
    notFound();
  }

  const boundUpdate = updateTestimonialAction.bind(null, testimonial.id);

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">{testimonial.author_name}</h1>
          <a href="/admin/testimonials" className="text-sm font-medium text-muted hover:underline">
            &larr; Back to reviews
          </a>
        </div>

        <p className="mt-2 text-yellow-500">
          {"★".repeat(testimonial.rating)}
          <span className="text-gray-300 dark:text-gray-600">
            {"★".repeat(5 - testimonial.rating)}
          </span>
        </p>

        <p className="mt-4 whitespace-pre-line text-sm text-foreground">{testimonial.body}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailField label="Submitted" value={new Date(testimonial.created_at).toLocaleString()} />
          <DetailField
            label="Contact email (private — never shown on the site)"
            value={testimonial.author_email}
          />
        </div>

        <form
          action={boundUpdate}
          className="mt-6 flex flex-wrap items-end gap-3 border-t border-border pt-6"
        >
          <div>
            <label className="block text-sm font-medium text-foreground">Status</label>
            <select
              name="status"
              defaultValue={testimonial.status}
              className="mt-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">
              Display order (approved only)
            </label>
            <input
              type="number"
              name="displayOrder"
              defaultValue={testimonial.display_order ?? 0}
              className="mt-1 w-28 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
