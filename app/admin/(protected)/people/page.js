import { getPeople } from "@/lib/people";
import { deletePersonAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminPeoplePage() {
  const people = await getPeople();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">People</h1>
            <p className="mt-1 text-sm text-muted">
              The person directory — enter someone once here, then assign them to a team at{" "}
              <a href="/admin/team-members" className="underline">
                /admin/team-members
              </a>
              .
            </p>
          </div>
          <a
            href="/admin/people/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add person
          </a>
        </div>

        {people.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No people yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {people.map((person) => (
              <div
                key={person.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-3">
                  {person.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={person.photo}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{person.name}</p>
                    <p className="text-sm text-muted">
                      {person.email || "—"}
                      {person.id_no ? ` · ${person.id_no}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/people/${person.id}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    View
                  </a>
                  <a
                    href={`/admin/people/${person.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    Edit
                  </a>
                  <form action={deletePersonAction}>
                    <input type="hidden" name="id" value={person.id} />
                    <DeleteButton
                      confirmMessage={`Delete "${person.name}"? This also deletes every team membership they have. This can't be undone.`}
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
