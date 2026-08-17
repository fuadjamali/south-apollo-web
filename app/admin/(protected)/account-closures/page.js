import { getPendingClosureRequests } from "@/lib/members";
import { closeMemberAccountAction, dismissClosureRequestAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

function formatDate(date) {
  return new Date(date).toLocaleString();
}

export default async function AdminAccountClosuresPage() {
  const requests = await getPendingClosureRequests();

  return (
    <div className="w-full max-w-3xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Account closure requests</h1>
        <p className="mt-1 text-sm text-muted">
          A member has asked to close their account. Talk to them first if you need to (their
          contact details are on their{" "}
          <span className="font-medium">member record</span>) — closing anonymizes their
          personal details but keeps the account row, so past orders and bookings still show
          correctly. This can&apos;t be undone.
        </p>

        {requests.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No pending closure requests.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {requests.map((r) => (
              <div key={r.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {r.name}{" "}
                      <a
                        href={`/admin/members/${r.id}`}
                        className="ml-1 text-sm font-normal text-accent hover:underline"
                      >
                        View member record
                      </a>
                    </p>
                    <p className="text-sm text-muted">
                      {r.email}
                      {r.mobile_no ? ` · ${r.mobile_no}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Requested {formatDate(r.closure_requested_at)}
                    </p>
                    {r.closure_reason && (
                      <p className="mt-2 whitespace-pre-line text-sm text-foreground">
                        &ldquo;{r.closure_reason}&rdquo;
                      </p>
                    )}
                  </div>
                  <form action={dismissClosureRequestAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                    >
                      Dismiss request
                    </button>
                  </form>
                </div>

                <form
                  action={closeMemberAccountAction}
                  className="mt-4 space-y-2 border-t border-border pt-4"
                >
                  <input type="hidden" name="id" value={r.id} />
                  <label className="block text-xs font-medium uppercase tracking-wide text-muted">
                    Internal note (optional — never shown to the member)
                  </label>
                  <textarea
                    name="adminNote"
                    rows={2}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none"
                  />
                  <DeleteButton
                    confirmMessage={`Close ${r.name}'s account? This anonymizes their personal details and can't be undone.`}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    Close account
                  </DeleteButton>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
