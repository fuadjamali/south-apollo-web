import { getPeople } from "@/lib/people";
import PersonForm from "@/components/PersonForm";
import { createPersonAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPersonPage() {
  const people = await getPeople();

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add person</h1>
        <PersonForm
          action={createPersonAction}
          existingNames={people.map((p) => p.name)}
          submitLabel="Create person"
        />
      </div>
    </div>
  );
}
