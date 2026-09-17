import { notFound } from "next/navigation";
import { getPerson } from "@/lib/people";
import DetailField from "@/components/DetailField";

export const dynamic = "force-dynamic";

export default async function AdminPersonDetailPage({ params }) {
  const { id } = await params;
  const person = await getPerson(id);

  if (!person) {
    notFound();
  }

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">{person.name}</h1>
          <div className="flex gap-2">
            <a
              href={`/admin/people/${person.id}/edit`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              Edit
            </a>
            <a href="/admin/people" className="self-center text-sm font-medium text-muted hover:underline">
              &larr; Back to people
            </a>
          </div>
        </div>

        {person.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={person.photo}
            alt=""
            className="mt-6 h-24 w-24 rounded-full border border-border object-cover"
          />
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailField label="ID No" value={person.id_no} />
          <DetailField label="Contact number" value={person.contact_no} />
          <DetailField label="Email" value={person.email} />
        </div>

        <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
          Added {new Date(person.created_at).toLocaleString()} · Updated{" "}
          {new Date(person.updated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
