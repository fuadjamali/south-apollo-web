import { getModuleStates, isEnabled, isPublicPathEnabled } from "@/lib/plan";
import { getContactInfo } from "@/lib/contactInfo";
import { getBusinessInfo } from "@/lib/businessInfo";
import { getNavTree } from "@/lib/navItems";

// Drops any nav item (or child of a group) whose module isn't in this deployment's plan, and
// drops a group entirely if every one of its children got filtered out — same pattern as the
// admin nav's filterNav in app/admin/(protected)/layout.js. Off the home page, in-page anchors
// ("#about") become home-page links ("/#about") — filtering runs first, since lib/plan.js gates
// anchors by their bare "#…" form.
export function buildSiteNav(navTree, { moduleStates, contactInfo, onHomePage }) {
  const isNavHrefEnabled = (href) =>
    href === "#contact-info" ? contactInfo.enabled : isPublicPathEnabled(href, moduleStates);
  const toHref = (href) => (!onHomePage && href?.startsWith("#") ? `/${href}` : href);

  return navTree
    .map((item) => {
      if (!item.children) return item;
      const children = item.children.filter((child) => isNavHrefEnabled(child.href));
      return children.length > 0 ? { ...item, children } : null;
    })
    .filter((item) => item && (item.children || isNavHrefEnabled(item.href)))
    .map((item) =>
      item.children
        ? { ...item, children: item.children.map((child) => ({ ...child, href: toHref(child.href) })) }
        : { ...item, href: toHref(item.href) }
    );
}

// Everything <SiteHeader> needs, for pages other than home (which already has this data loaded
// and calls buildSiteNav directly).
export async function getSiteHeaderProps(locale) {
  const [moduleStates, contactInfo, business, navTree] = await Promise.all([
    getModuleStates(),
    getContactInfo(),
    getBusinessInfo(),
    getNavTree(locale),
  ]);
  return {
    nav: buildSiteNav(navTree, { moduleStates, contactInfo, onHomePage: false }),
    businessName: business.name,
    cartEnabled: isEnabled("cart", moduleStates),
    membersEnabled: isEnabled("members", moduleStates),
    themesEnabled: isEnabled("themes", moduleStates),
    footerEnabled: isEnabled("footer", moduleStates),
    onHomePage: false,
  };
}
