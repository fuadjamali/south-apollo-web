import { getPartners } from "@/lib/partners";
import { deletePartnerAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

const STATUS_BADGE = {
  Active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Inactive: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

export default async function AdminPartnersPage() {
  const partners = await getPartners();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Partners</h1>
            <p className="mt-1 text-sm text-muted">
              Active partners&apos; logos appear in the home page&apos;s &quot;Trusted by&quot;
              strip. Changes appear on the live site immediately.
            </p>
          </div>
          <a
            href="/admin/partners/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add partner
          </a>
        </div>

        {partners.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No partners yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  {partner.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={partner.logo}
                      alt=""
                      className="h-10 w-16 rounded-md object-contain"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">
                      {partner.name}{" "}
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[partner.status]}`}
                      >
                        {partner.status}
                      </span>
                    </p>
                    <p className="text-sm text-muted">
                      order {partner.display_order}
                      {partner.link_url ? " · linked" : ""} ·{" "}
                      {partner.partnership_from
                        ? new Date(partner.partnership_from).toLocaleDateString()
                        : "No start date"}
                      {partner.partnership_ended
                        ? ` – ${new Date(partner.partnership_ended).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/partners/${partner.id}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    View
                  </a>
                  <a
                    href={`/admin/partners/${partner.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    Edit
                  </a>
                  <form action={deletePartnerAction}>
                    <input type="hidden" name="id" value={partner.id} />
                    <DeleteButton
                      confirmMessage={`Delete "${partner.name}"? This can't be undone.`}
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
