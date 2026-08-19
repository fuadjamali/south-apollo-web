import AdminHeader from "@/components/AdminHeader";
import siteConfig from "@/config/site";
import { PLAN, getModuleStates, isEnabled, isNavItemEnabled } from "@/lib/plan";

// Drops any nav item (or child of a group) whose module isn't in this deployment's plan, and
// drops a group entirely if every one of its children got filtered out.
function filterNav(nav, states) {
  return nav
    .map((item) => {
      if (!item.children) return item;
      const children = item.children.filter((child) => isNavItemEnabled(child.href, states));
      return children.length > 0 ? { ...item, children } : null;
    })
    .filter((item) => item && (item.children || isNavItemEnabled(item.href, states)));
}

export default async function AdminLayout({ children }) {
  const moduleStates = await getModuleStates();
  const filteredNav = filterNav(siteConfig.admin.nav, moduleStates);
  const themesEnabled = isEnabled("themes", moduleStates);

  return (
    <div className="flex min-h-screen flex-col bg-surface-alt">
      <AdminHeader nav={filteredNav} themesEnabled={themesEnabled} plan={PLAN} />

      <main className="flex flex-1 items-center justify-center px-6 py-10">{children}</main>
    </div>
  );
}
