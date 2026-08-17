import { notFound } from "next/navigation";
import { getCertification } from "@/lib/certifications";
import DetailField from "@/components/DetailField";

export const dynamic = "force-dynamic";

export default async function AdminCertificationDetailPage({ params }) {
  const { id } = await params;
  const certification = await getCertification(id);

  if (!certification) {
    notFound();
  }

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">{certification.name}</h1>
          <div className="flex gap-2">
            <a
              href={`/admin/certifications/${certification.id}/edit`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              Edit
            </a>
            <a
              href="/admin/certifications"
              className="self-center text-sm font-medium text-muted hover:underline"
            >
              &larr; Back to certifications
            </a>
          </div>
        </div>

        {certification.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={certification.image}
            alt=""
            className="mt-6 h-24 w-24 rounded-lg border border-border bg-surface-alt object-contain p-3"
          />
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailField label="Display order" value={certification.display_order} />
        </div>

        <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
          Added {new Date(certification.created_at).toLocaleString()} · Updated{" "}
          {new Date(certification.updated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
