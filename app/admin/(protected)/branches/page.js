import { getAllBranches } from "@/lib/branches";
import { deleteBranchAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminBranchesPage() {
  const branches = await getAllBranches();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Branches</h1>
            <p className="mt-1 text-sm text-muted">
              Shown in the &ldquo;Our Branches&rdquo; section on the home page, main branch first. The section
              heading is edited under Section Text.
            </p>
          </div>
          <a
            href="/admin/branches/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add branch
          </a>
        </div>

        {branches.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No branches yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {branches.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                    {b.name_en}
                    {b.name_bn && <span className="font-normal text-muted">· {b.name_bn}</span>}
                    {b.is_main && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">Main</span>
                    )}
                    {!b.active && (
                      <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs font-medium text-muted">Hidden</span>
                    )}
                  </p>
                  <p className="text-sm text-muted">{b.address_en || "No address"}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/branches/${b.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    Edit
                  </a>
                  <form action={deleteBranchAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <DeleteButton
                      confirmMessage={`Delete "${b.name_en}"? This can't be undone.`}
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
