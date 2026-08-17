import { getPendingPasswordResets } from "@/lib/members";
import CopyLinkButton from "@/components/CopyLinkButton";

export const dynamic = "force-dynamic";

function formatExpiry(date) {
  return new Date(date).toLocaleString();
}

export default async function AdminMemberResetsPage() {
  const resets = await getPendingPasswordResets();
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return (
    <div className="w-full max-w-3xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Member password resets</h1>
        <p className="mt-1 text-sm text-muted">
          No email is configured yet, so members requesting a password reset land here instead.
          Copy the link below and send it to the member yourself (WhatsApp, email, etc). Links
          expire automatically after 1 hour, or once used.
        </p>

        {resets.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No pending reset requests.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {resets.map((reset) => {
              const link = `${baseUrl}/member/reset-password?token=${reset.reset_token}`;
              return (
                <div
                  key={reset.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {reset.name} <span className="text-sm font-normal text-muted">({reset.email})</span>
                    </p>
                    <p className="text-sm text-muted">
                      Expires {formatExpiry(reset.reset_token_expires)}
                    </p>
                  </div>
                  <CopyLinkButton
                    link={link}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
