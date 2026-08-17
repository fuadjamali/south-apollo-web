import { getMembers } from "@/lib/members";
import { deleteMemberAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

const STATUS_BADGE = {
  Active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Expired: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  Suspended: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  Closed: "bg-gray-300 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export default async function AdminMembersPage() {
  const members = await getMembers();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Members</h1>
            <p className="mt-1 text-sm text-muted">
              Members can check their status at{" "}
              <a href="/membership" className="underline">
                /membership
              </a>
              , or sign in at{" "}
              <a href="/member/login" className="underline">
                /member/login
              </a>{" "}
              once they&apos;ve set a password.
            </p>
          </div>
          <a
            href="/admin/members/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add member
          </a>
        </div>

        {members.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No members yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {member.first_name} {member.last_name}{" "}
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[member.membership_status]}`}
                    >
                      {member.membership_status}
                    </span>
                    {member.password_hash && (
                      <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                        Login active
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted">
                    {member.member_id}
                    {member.postcode ? ` · ${member.postcode}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/members/${member.id}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    View
                  </a>
                  <a
                    href={`/admin/members/${member.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    Edit
                  </a>
                  <form action={deleteMemberAction}>
                    <input type="hidden" name="id" value={member.id} />
                    <DeleteButton
                      confirmMessage={`Delete "${member.first_name} ${member.last_name}" (${member.member_id})? This can't be undone.`}
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
