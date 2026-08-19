import { getFlatAdminNavItems } from "@/lib/adminNavItems";
import AdminNavItemEditForm from "@/components/AdminNavItemEditForm";
import AdminNavAddForm from "@/components/AdminNavAddForm";

export const dynamic = "force-dynamic";

export default async function AdminAdminNavPage() {
  const items = await getFlatAdminNavItems();
  const topLevel = items.filter((i) => i.parent_id === null);
  const childrenByParent = {};
  for (const item of items) {
    if (item.parent_id === null) continue;
    (childrenByParent[item.parent_id] ??= []).push(item);
  }

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Admin Navigation</h1>
        <p className="mt-1 text-sm text-muted">
          The sidebar menu on this admin panel itself — internal tooling, not shown to visitors
          of the public site. A group becomes a dropdown holding its own links; a plain item
          links directly. Lower "order" numbers show first. The lowest-order top-level item is
          underlined as the active/root item, so keep something like "Home" first.
        </p>

        <div className="mt-6 space-y-6 divide-y divide-border">
          {topLevel.map((item) => {
            const children = childrenByParent[item.id] || [];
            const isGroup = item.href === null;
            return (
              <div key={item.id} className="space-y-3 pt-6 first:pt-0">
                <AdminNavItemEditForm
                  item={item}
                  isGroup={isGroup}
                  confirmMessage={
                    isGroup
                      ? `Delete the "${item.label}" group and everything in it? This can't be undone.`
                      : `Delete "${item.label}"? This can't be undone.`
                  }
                />

                {isGroup && (
                  <div className="ml-4 space-y-2 border-l border-border pl-4">
                    {children.map((child) => (
                      <AdminNavItemEditForm
                        key={child.id}
                        item={child}
                        confirmMessage={`Delete "${child.label}" from ${item.label}? This can't be undone.`}
                      />
                    ))}
                    <AdminNavAddForm kind="child" parentId={item.id} submitLabel="Add link to group" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-foreground">Add group</p>
            <p className="mt-1 text-xs text-muted">
              A new dropdown menu — add links to it below once created.
            </p>
            <div className="mt-2">
              <AdminNavAddForm kind="group" submitLabel="Add group" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Add link</p>
            <p className="mt-1 text-xs text-muted">A plain top-level menu link.</p>
            <div className="mt-2">
              <AdminNavAddForm kind="link" submitLabel="Add link" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
