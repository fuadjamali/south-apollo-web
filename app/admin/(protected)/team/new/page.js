import TeamForm from "@/components/TeamForm";
import { createTeamAction } from "../actions";

export default function NewTeamPage() {
  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add team</h1>
        <TeamForm action={createTeamAction} submitLabel="Create team" />
      </div>
    </div>
  );
}
