import MemberForm from "@/components/MemberForm";
import { createMemberAction } from "../actions";

export default function NewMemberPage() {
  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add member</h1>
        <MemberForm action={createMemberAction} submitLabel="Create member" />
      </div>
    </div>
  );
}
