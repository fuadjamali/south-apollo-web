import { notFound } from "next/navigation";
import { getPartner } from "@/lib/partners";
import DetailField from "@/components/DetailField";

export const dynamic = "force-dynamic";

const STATUS_BADGE = {
  Active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Inactive: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : null;
}

export default async function AdminPartnerDetailPage({ params }) {
  const { id } = await params;
  const partner = await getPartner(id);

  if (!partner) {
    notFound();
  }

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">
            {partner.name}{" "}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[partner.status]}`}
            >
              {partner.status}
            </span>
          </h1>
          <div className="flex gap-2">
            <a
              href={`/admin/partners/${partner.id}/edit`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              Edit
            </a>
            <a
              href="/admin/partners"
              className="self-center text-sm font-medium text-muted hover:underline"
            >
              &larr; Back to partners
            </a>
          </div>
        </div>

        {partner.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={partner.logo}
            alt=""
            className="mt-6 h-32 w-full rounded-lg border border-border bg-surface-alt object-contain p-4"
          />
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailField label="Partnered since" value={formatDate(partner.partnership_from)} />
          <DetailField label="Partnership ended" value={formatDate(partner.partnership_ended)} />
          <DetailField label="Display order" value={partner.display_order} />
          <DetailField label="Link" value={partner.link_url} />
        </div>
        <DetailField label="Description" value={partner.description} className="mt-4" />

        <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
          Added {new Date(partner.created_at).toLocaleString()} · Updated{" "}
          {new Date(partner.updated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
