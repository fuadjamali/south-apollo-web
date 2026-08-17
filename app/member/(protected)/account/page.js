import { getMemberSession } from "@/lib/memberSession";
import { getMember } from "@/lib/members";
import MemberChangePasswordForm from "@/components/MemberChangePasswordForm";
import AccountClosureForm from "@/components/AccountClosureForm";

export const dynamic = "force-dynamic";

const STATUS_STYLE = {
  Active: "text-green-600 dark:text-green-400",
  Expired: "text-yellow-600 dark:text-yellow-400",
  Suspended: "text-red-600 dark:text-red-400",
  Closed: "text-gray-500 dark:text-gray-400",
};

export default async function MemberAccountPage() {
  const session = await getMemberSession();
  const member = await getMember(session.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">My account</h1>
            <p className="mt-1 text-sm text-muted">
              Signed in as {session?.name} ({session?.email})
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/member/orders"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              My orders
            </a>
            <a
              href="/member/bookings"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              My bookings
            </a>
          </div>
        </div>

        {member && (
          <div className="mt-6 flex items-center justify-between rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm">
            <span className="text-muted">
              Membership <span className="font-medium text-foreground">{member.member_id}</span>
            </span>
            <span className={`font-semibold ${STATUS_STYLE[member.membership_status] || ""}`}>
              {member.membership_status}
            </span>
          </div>
        )}

        <MemberChangePasswordForm />

        <div className="mt-8 border-t border-border pt-6">
          <p className="text-sm font-semibold text-foreground">Close my account</p>
          {member?.closure_requested_at ? (
            <p className="mt-2 text-sm text-muted">
              You requested account closure on{" "}
              {new Date(member.closure_requested_at).toLocaleDateString()}. An admin will be in
              touch before anything is closed.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted">
                This sends a request to an admin, who&apos;ll review it (and may reach out to
                confirm) before closing anything — nothing is deleted immediately.
              </p>
              <AccountClosureForm />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
