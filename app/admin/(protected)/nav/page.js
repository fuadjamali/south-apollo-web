import { getFlatNavItems } from "@/lib/navItems";
import { getModuleStates, isEnabled } from "@/lib/plan";
import { getContactInfo } from "@/lib/contactInfo";
import { findDestination } from "@/lib/navDestinations";
import NavItemEditForm from "@/components/NavItemEditForm";
import NavAddForm from "@/components/NavAddForm";
import NavReorderableList from "@/components/NavReorderableList";
import { reorderNavItemsAction } from "./actions";

export const dynamic = "force-dynamic";

// "hidden" when this href's destination (lib/navDestinations.js) resolves to a module/section
// that's currently switched off; null when it's enabled, or when the href is external/custom
// (this page has no way to check the health of a link it doesn't recognize — that's expected,
// not an error). #contact-info is a special case, same as everywhere else in the codebase that
// checks it: its on/off state lives on the contact_info row, not module_settings.
function statusFor(href, moduleStates, contactInfoEnabled) {
  if (!href) return null;
  if (href === "#contact-info") return contactInfoEnabled ? null : "hidden";
  const dest = findDestination(href);
  if (!dest || !dest.module) return null;
  return isEnabled(dest.module, moduleStates) ? null : "hidden";
}

export default async function AdminNavPage() {
  const [items, moduleStates, contactInfo] = await Promise.all([
    getFlatNavItems(),
    getModuleStates(),
    getContactInfo(),
  ]);
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
          The header menu shown at the top of every public page. Drag the handle (or use the
          arrows) to reorder — changes save immediately, no separate step. A group becomes a
          dropdown holding its own links; a plain item links directly. Pick a destination from
          the list rather than typing a link by hand and there&apos;s nothing to misspell; a
          link pointing at something currently switched off is flagged right here, not just
          silently missing on the live site.
        </p>

        <div className="mt-6 space-y-6 divide-y divide-border">
          <NavReorderableList items={topLevel} parentId={null} reorderAction={reorderNavItemsAction}>
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
                    status={statusFor(item.href, moduleStates, contactInfo.enabled)}
                  />

                  {isGroup && (
                    <div className="ml-4 space-y-3 border-l border-border pl-4">
                      {children.length > 0 && (
                        <NavReorderableList
                          items={children}
                          parentId={item.id}
                          reorderAction={reorderNavItemsAction}
                        >
                          {children.map((child) => (
                            <NavItemEditForm
                              key={child.id}
                              item={child}
                              isChild
                              confirmMessage={`Delete "${child.label}" from ${item.label}? This can't be undone.`}
                              status={statusFor(child.href, moduleStates, contactInfo.enabled)}
                            />
                          ))}
                        </NavReorderableList>
                      )}
                      <NavAddForm kind="child" parentId={item.id} submitLabel="Add link to group" />
                    </div>
                  )}
                </div>
              );
            })}
          </NavReorderableList>
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
