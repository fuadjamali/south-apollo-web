import { getWaitlist } from "@/lib/bookingWaitlist";
import { setWaitlistStatusAction, deleteWaitlistAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

export default async function AdminBookingWaitlistPage() {
  const entries = await getWaitlist();

  return (
    <div className="w-full max-w-3xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Booking waitlist</h1>
        <p className="mt-1 text-sm text-muted">
          Customers who wanted a date with no open slots. No automatic matching — check back
          here and follow up directly (call, email, WhatsApp) if a slot on their date frees up.
        </p>

        {entries.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No one&apos;s waiting right now.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {entry.customer_name}{" "}
                      <span className="ml-1 rounded-full bg-surface-alt px-2 py-0.5 text-xs font-medium text-muted">
                        {entry.status}
                      </span>
                    </p>
                    <p className="text-sm text-muted">
                      {entry.service_name} · wants {formatDate(entry.preferred_date)}
                    </p>
                    <p className="text-sm text-muted">
                      {entry.customer_email}
                      {entry.customer_phone ? ` · ${entry.customer_phone}` : ""}
                    </p>
                    {entry.notes && (
                      <p className="mt-1 whitespace-pre-line text-sm text-foreground">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.status !== "Notified" && (
                      <form action={setWaitlistStatusAction}>
                        <input type="hidden" name="id" value={entry.id} />
                        <input type="hidden" name="status" value="Notified" />
                        <button
                          type="submit"
                          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                        >
                          Mark notified
                        </button>
                      </form>
                    )}
                    <form action={setWaitlistStatusAction}>
                      <input type="hidden" name="id" value={entry.id} />
                      <input type="hidden" name="status" value="Fulfilled" />
                      <button
                        type="submit"
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-surface-alt dark:text-green-400"
                      >
                        Fulfilled
                      </button>
                    </form>
                    <form action={setWaitlistStatusAction}>
                      <input type="hidden" name="id" value={entry.id} />
                      <input type="hidden" name="status" value="Cancelled" />
                      <button
                        type="submit"
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                      >
                        Cancel
                      </button>
                    </form>
                    <form action={deleteWaitlistAction}>
                      <input type="hidden" name="id" value={entry.id} />
                      <DeleteButton
                        confirmMessage={`Delete ${entry.customer_name}'s waitlist entry?`}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-surface-alt dark:text-red-400"
                      />
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
