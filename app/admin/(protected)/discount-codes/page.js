import { getDiscountCodes } from "@/lib/discountCodes";
import { deleteDiscountCodeAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

function formatValue(dc) {
  return dc.type === "percentage" ? `${dc.value}% off` : `${dc.value} off`;
}

function formatExpiry(date) {
  return date ? new Date(date).toLocaleDateString() : "No expiry";
}

export default async function AdminDiscountCodesPage() {
  const discountCodes = await getDiscountCodes();

  return (
    <div className="w-full max-w-3xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Discount codes</h1>
            <p className="mt-1 text-sm text-muted">
              Applied at checkout. The discount amount is always recalculated server-side when
              an order is placed, never trusted from the checkout form.
            </p>
          </div>
          <a
            href="/admin/discount-codes/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add code
          </a>
        </div>

        {discountCodes.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No discount codes yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {discountCodes.map((dc) => (
              <div
                key={dc.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {dc.code}
                    {!dc.active && (
                      <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        Inactive
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted">
                    {formatValue(dc)} · used {dc.times_used}
                    {dc.usage_limit ? ` / ${dc.usage_limit}` : ""} · {formatExpiry(dc.expires_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/discount-codes/${dc.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    Edit
                  </a>
                  <form action={deleteDiscountCodeAction}>
                    <input type="hidden" name="id" value={dc.id} />
                    <DeleteButton
                      confirmMessage={`Delete code "${dc.code}"? This can't be undone.`}
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
