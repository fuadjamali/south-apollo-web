import { notFound } from "next/navigation";
import { getStat } from "@/lib/stats";
import DetailField from "@/components/DetailField";

export const dynamic = "force-dynamic";

export default async function AdminStatDetailPage({ params }) {
  const { id } = await params;
  const stat = await getStat(id);

  if (!stat) {
    notFound();
  }

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">
            {stat.value} <span className="font-normal text-muted">— {stat.label}</span>
          </h1>
          <div className="flex gap-2">
            <a
              href={`/admin/stats/${stat.id}/edit`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              Edit
            </a>
            <a
              href="/admin/stats"
              className="self-center text-sm font-medium text-muted hover:underline"
            >
              &larr; Back to stats
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailField label="Value" value={stat.value} />
          <DetailField label="Label" value={stat.label} />
          <DetailField label="Display order" value={stat.display_order} />
        </div>

        <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
          Added {new Date(stat.created_at).toLocaleString()} · Updated{" "}
          {new Date(stat.updated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
