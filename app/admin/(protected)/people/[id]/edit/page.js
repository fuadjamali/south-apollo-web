import { notFound } from "next/navigation";
import { getPerson, getPeople } from "@/lib/people";
import PersonForm from "@/components/PersonForm";
import DeleteButton from "@/components/DeleteButton";
import { updatePersonAction, deletePersonAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPersonPage({ params }) {
  const { id } = await params;
  const [person, people] = await Promise.all([getPerson(id), getPeople()]);

  if (!person) {
    notFound();
  }

  const boundUpdate = updatePersonAction.bind(null, person.id);
  const existingNames = people.filter((p) => p.id !== person.id).map((p) => p.name);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit person</h1>
        <PersonForm
          action={boundUpdate}
          person={person}
          existingNames={existingNames}
          submitLabel="Save changes"
        />

        <form action={deletePersonAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={person.id} />
          <DeleteButton
            confirmMessage={`Delete "${person.name}"? This also deletes every team membership they have. This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this person
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
