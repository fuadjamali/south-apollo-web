import { notFound } from "next/navigation";
import { getMember } from "@/lib/members";
import MemberForm from "@/components/MemberForm";
import DeleteButton from "@/components/DeleteButton";
import { updateMemberAction, deleteMemberAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditMemberPage({ params }) {
  const { id } = await params;
  const member = await getMember(id);

  if (!member) {
    notFound();
  }

  const boundUpdate = updateMemberAction.bind(null, member.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit member</h1>
        <MemberForm action={boundUpdate} member={member} submitLabel="Save changes" />

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
