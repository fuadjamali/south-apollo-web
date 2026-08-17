import { notFound } from "next/navigation";
import { getStep } from "@/lib/howItWorks";
import DetailField from "@/components/DetailField";

export const dynamic = "force-dynamic";

export default async function AdminHowItWorksDetailPage({ params }) {
  const { id } = await params;
  const step = await getStep(id);

  if (!step) {
    notFound();
  }

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">{step.title}</h1>
          <div className="flex gap-2">
            <a
              href={`/admin/how-it-works/${step.id}/edit`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              Edit
            </a>
            <a
              href="/admin/how-it-works"
              className="self-center text-sm font-medium text-muted hover:underline"
            >
              &larr; Back to how it works
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailField label="Display order" value={step.display_order} />
        </div>
        <DetailField label="Description" value={step.description} className="mt-4" />

        <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
          Added {new Date(step.created_at).toLocaleString()} · Updated{" "}
          {new Date(step.updated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
