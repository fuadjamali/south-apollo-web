import { notFound } from "next/navigation";
import { getMember } from "@/lib/members";
import MemberForm from "@/components/MemberForm";
import DeleteButton from "@/components/DeleteButton";
import AdminSetMemberPasswordForm from "@/components/AdminSetMemberPasswordForm";
import { updateMemberAction, deleteMemberAction, setMemberPasswordAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditMemberPage({ params }) {
  const { id } = await params;
  const member = await getMember(id);

  if (!member) {
    notFound();
  }

  const boundUpdate = updateMemberAction.bind(null, member.id);
  const boundSetPassword = setMemberPasswordAction.bind(null, member.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit member</h1>
        <MemberForm action={boundUpdate} member={member} submitLabel="Save changes" />

        <div className="mt-6 border-t border-border pt-6">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            Login
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                member.password_hash
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {member.password_hash ? "Active" : "Inactive — no password set"}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted">
            {member.email
              ? `Signs in at /member/login with ${member.email}.`
              : "No email on file — add one above before setting a password, so they can sign in."}
          </p>
          <AdminSetMemberPasswordForm
            action={boundSetPassword}
            hasPassword={!!member.password_hash}
          />
        </div>

        <form action={deleteMemberAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={member.id} />
          <DeleteButton
            confirmMessage={`Delete "${member.first_name} ${member.last_name}" (${member.member_id})? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this member
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
