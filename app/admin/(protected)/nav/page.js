import { getFlatNavItems } from "@/lib/navItems";
import NavItemEditForm from "@/components/NavItemEditForm";
import NavAddForm from "@/components/NavAddForm";

export const dynamic = "force-dynamic";

export default async function AdminNavPage() {
  const items = await getFlatNavItems();
  const topLevel = items.filter((i) => i.parent_id === null);
  const childrenByParent = {};
  for (const item of items) {
    if (item.parent_id === null) continue;
    (childrenByParent[item.parent_id] ??= []).push(item);
  }

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Site Navigation</h1>
        <p className="mt-1 text-sm text-muted">
          The header menu shown at the top of every public page. A group becomes a dropdown
          holding its own links; a plain item links directly. Lower "order" numbers show first.
          An item still only appears live if the page or section it points to is turned on
          elsewhere (Settings → Feature Config).
        </p>

        <div className="mt-6 space-y-6 divide-y divide-border">
          {topLevel.map((item) => {
            const children = childrenByParent[item.id] || [];
            const isGroup = item.href === null;
            return (
              <div key={item.id} className="space-y-3 pt-6 first:pt-0">
                <NavItemEditForm
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
                      <NavItemEditForm
                        key={child.id}
                        item={child}
                        isChild
                        confirmMessage={`Delete "${child.label}" from ${item.label}? This can't be undone.`}
                      />
                    ))}
                    <NavAddForm kind="child" parentId={item.id} submitLabel="Add link to group" />
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
              <NavAddForm kind="group" submitLabel="Add group" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Add link</p>
            <p className="mt-1 text-xs text-muted">A plain top-level menu link.</p>
            <div className="mt-2">
              <NavAddForm kind="link" submitLabel="Add link" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
