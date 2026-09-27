import { db } from "@/lib/db";

// The admin panel's own sidebar menu — used to live as a hardcoded array in
// config/site.js (siteConfig.admin.nav). Same shape/pattern as lib/navItems.js (the public
// site's nav), just a separate table since these hrefs are gated by a different lookup
// (isNavItemEnabled/NAV_HREF_MODULES in lib/plan.js) and rendered by AdminHeader.js, not
// SiteHeader.js. No cta/highlight columns — AdminHeader.js doesn't support those, it just
// underlines whichever item is first (kept "Home" by seeding it at display_order 1).
const ADMIN_NAV_SEED_LOCK_KEY = "south_apollo_web:admin_nav_items";

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS admin_nav_items (
      id SERIAL PRIMARY KEY,
      parent_id INT REFERENCES admin_nav_items(id) ON DELETE CASCADE,
      label VARCHAR(100) NOT NULL,
      href VARCHAR(255),
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// Same menu that used to live in config/site.js's `admin.nav` array — the seed values, not
// placeholders.
const DEFAULT_ADMIN_NAV = [
  { label: "Home", href: "/admin" },
  {
    label: "Layout",
    children: [
      { label: "Home Page Layout", href: "/admin/home-layout" },
      { label: "Section Text", href: "/admin/section-text" },
      { label: "Site Navigation", href: "/admin/nav" },
    ],
  },
  {
    label: "Content",
    children: [
      { label: "Hero", href: "/admin/hero" },
      { label: "Stats", href: "/admin/stats" },
      { label: "How It Works", href: "/admin/how-it-works" },
      { label: "Products", href: "/admin/products" },
      { label: "Portfolio", href: "/admin/portfolio" },
      { label: "Gallery", href: "/admin/gallery" },
      { label: "Blog", href: "/admin/blog" },
      { label: "News & Events", href: "/admin/news-events" },
      { label: "Reviews (Platforms)", href: "/admin/reviews" },
      { label: "Reviews (Customer)", href: "/admin/testimonials" },
      { label: "About", href: "/admin/about" },
      { label: "Vision & Mission", href: "/admin/vision-mission" },
      { label: "History", href: "/admin/history" },
      { label: "Certifications", href: "/admin/certifications" },
      { label: "Social & WhatsApp", href: "/admin/social" },
    ],
  },
  {
    label: "People",
    children: [
      { label: "People Directory", href: "/admin/people" },
      { label: "Team", href: "/admin/team" },
      { label: "Team Members", href: "/admin/team-members" },
      { label: "Members", href: "/admin/members" },
      { label: "Member Password Resets", href: "/admin/member-resets" },
      { label: "Account Closure Requests", href: "/admin/account-closures" },
      { label: "Partners", href: "/admin/partners" },
    ],
  },
  {
    label: "Booking",
    children: [
      { label: "Booking Services", href: "/admin/booking-services" },
      { label: "Availability", href: "/admin/availability" },
      { label: "Bookings", href: "/admin/bookings" },
      { label: "Booking Waitlist", href: "/admin/booking-waitlist" },
    ],
  },
  {
    label: "Insights",
    children: [
      { label: "Orders", href: "/admin/orders" },
      { label: "Discount Codes", href: "/admin/discount-codes" },
      { label: "Enquiries", href: "/admin/enquiries" },
      { label: "Analytics", href: "/admin/analytics" },
    ],
  },
  { label: "Contact Us", href: "/admin/contact" },
  {
    label: "Settings",
    children: [
      { label: "Business Info", href: "/admin/business" },
      { label: "Logo & Icons", href: "/admin/logo" },
      { label: "Legal Pages", href: "/admin/legal" },
      { label: "Site Text", href: "/admin/site-text" },
      { label: "Root Alert", href: "/admin/root-alert" },
      { label: "Admin Panel Text", href: "/admin/admin-text" },
      { label: "Admin Navigation", href: "/admin/admin-nav" },
      { label: "Account", href: "/admin/account" },
      { label: "Subscription", href: "/admin/subscription" },
      { label: "AI Assistant", href: "/admin/ai-settings" },
      { label: "Feature Config", href: "/admin/features" },
    ],
  },
];

// See lib/navItems.js's ensureSeeded comment for why this holds a pg_advisory_xact_lock across
// both the create and the seed check — avoids the "CREATE TABLE IF NOT EXISTS" race that can
// otherwise trip under concurrent first-time callers (e.g. every admin page render during
// `next build`).
async function ensureSeeded() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [ADMIN_NAV_SEED_LOCK_KEY]);
    await ensureTable(client);
    const { rows } = await client.query("SELECT COUNT(*)::int AS count FROM admin_nav_items");
    if (rows[0].count === 0) {
      let order = 0;
      for (const item of DEFAULT_ADMIN_NAV) {
        order += 1;
        const {
          rows: [parent],
        } = await client.query(
          "INSERT INTO admin_nav_items (label, href, display_order) VALUES ($1, $2, $3) RETURNING id",
          [item.label, item.href || null, order]
        );
        if (item.children) {
          let childOrder = 0;
          for (const child of item.children) {
            childOrder += 1;
            await client.query(
              "INSERT INTO admin_nav_items (parent_id, label, href, display_order) VALUES ($1, $2, $3, $4)",
              [parent.id, child.label, child.href, childOrder]
            );
          }
        }
      }
    } else {
      // Migration: same idea as lib/navItems.js's own backfill — Vision & Mission and History
      // shipped after admin_nav_items was already seeded on existing deployments, so backfill
      // them into the "Content" group by href, safe to run on every call (checks existence
      // first, and stays quiet forever once both are present or deliberately removed).
      const { rows: existing } = await client.query(
        "SELECT href FROM admin_nav_items WHERE href IN ('/admin/vision-mission', '/admin/history')"
      );
      const have = new Set(existing.map((r) => r.href));
      const missing = [
        { label: "Vision & Mission", href: "/admin/vision-mission" },
        { label: "History", href: "/admin/history" },
      ].filter((item) => !have.has(item.href));
      if (missing.length > 0) {
        const {
          rows: [contentParent],
        } = await client.query(
          "SELECT id FROM admin_nav_items WHERE parent_id IS NULL AND label = 'Content' LIMIT 1"
        );
        if (contentParent) {
          const {
            rows: [{ next }],
          } = await client.query(
            "SELECT COALESCE(MAX(display_order), 0) + 1 AS next FROM admin_nav_items WHERE parent_id = $1",
            [contentParent.id]
          );
          let order = next;
          for (const item of missing) {
            await client.query(
              "INSERT INTO admin_nav_items (parent_id, label, href, display_order) VALUES ($1, $2, $3, $4)",
              [contentParent.id, item.label, item.href, order]
            );
            order += 1;
          }
        }
      }

      // Migration: History Timeline (the milestones list behind History's old, now-retired
      // manual-CRUD timeline view) is gone — History gets its timeline from the same body-text
      // content-shape detection About/Vision & Mission use instead (see
      // components/ImageTextSection.js's parseTimeline). Removes the nav item on any deployment
      // where it was seeded before this was retired; a no-op once it's gone.
      await client.query("DELETE FROM admin_nav_items WHERE href = '/admin/history-milestones'");

      // Migration: People Directory (lib/people.js) shipped after admin_nav_items was already
      // seeded on existing deployments — same backfill idea as Vision & Mission/History above,
      // placed in the "People" group right before "Team" since a membership now references a
      // person from that directory.
      const {
        rows: [peopleNavExisting],
      } = await client.query("SELECT id FROM admin_nav_items WHERE href = '/admin/people' LIMIT 1");
      if (!peopleNavExisting) {
        const {
          rows: [peopleGroupParent],
        } = await client.query(
          "SELECT id FROM admin_nav_items WHERE parent_id IS NULL AND label = 'People' LIMIT 1"
        );
        if (peopleGroupParent) {
          const {
            rows: [{ min: teamOrder }],
          } = await client.query(
            `SELECT COALESCE(MIN(display_order), 1) AS min FROM admin_nav_items
             WHERE parent_id = $1 AND href = '/admin/team'`,
            [peopleGroupParent.id]
          );
          // Shift every existing child at or after Team's slot down by one to make room,
          // then insert People Directory right before it — so it lands first, matching
          // DEFAULT_ADMIN_NAV's order on a fresh seed, rather than tacked on at the end.
          await client.query(
            `UPDATE admin_nav_items SET display_order = display_order + 1
             WHERE parent_id = $1 AND display_order >= $2`,
            [peopleGroupParent.id, teamOrder]
          );
          await client.query(
            "INSERT INTO admin_nav_items (parent_id, label, href, display_order) VALUES ($1, $2, $3, $4)",
            [peopleGroupParent.id, "People Directory", "/admin/people", teamOrder]
          );
        }
      }

      // Migration: group Home Page Layout, Section Text, and Site Navigation under one new
      // "Layout" menu, right after "Home" — these three used to be scattered (Home Page Layout
      // top-level from its own earlier backfill below; Section Text/Site Navigation inside
      // "Content" alongside unrelated content-editing pages). Safe to run on every call: each
      // step checks current state first, so it's a no-op once the reorganization is in place,
      // and it moves each item by href regardless of where it currently lives (including an
      // admin having already dragged one elsewhere via /admin/admin-nav — this only fires while
      // the item hasn't been placed under Layout yet, not repeatedly forcing it back).
      const {
        rows: [existingLayoutParent],
      } = await client.query(
        "SELECT id FROM admin_nav_items WHERE parent_id IS NULL AND label = 'Layout' LIMIT 1"
      );
      let layoutParentId = existingLayoutParent?.id;
      if (!layoutParentId) {
        const {
          rows: [homeItem],
        } = await client.query(
          "SELECT display_order FROM admin_nav_items WHERE parent_id IS NULL AND href = '/admin' LIMIT 1"
        );
        const insertAt = (homeItem?.display_order ?? 0) + 1;
        await client.query(
          "UPDATE admin_nav_items SET display_order = display_order + 1 WHERE parent_id IS NULL AND display_order >= $1",
          [insertAt]
        );
        const {
          rows: [createdParent],
        } = await client.query(
          "INSERT INTO admin_nav_items (label, display_order) VALUES ('Layout', $1) RETURNING id",
          [insertAt]
        );
        layoutParentId = createdParent.id;
      }

      const layoutChildren = [
        { label: "Home Page Layout", href: "/admin/home-layout" },
        { label: "Section Text", href: "/admin/section-text" },
        { label: "Site Navigation", href: "/admin/nav" },
      ];
      const { rows: currentLayoutChildren } = await client.query(
        "SELECT href, display_order FROM admin_nav_items WHERE parent_id = $1",
        [layoutParentId]
      );
      const alreadyUnderLayout = new Set(currentLayoutChildren.map((r) => r.href));
      let nextChildOrder = currentLayoutChildren.length
        ? Math.max(...currentLayoutChildren.map((r) => r.display_order)) + 1
        : 1;
      for (const item of layoutChildren) {
        if (alreadyUnderLayout.has(item.href)) continue;
        const { rows: existingRow } = await client.query(
          "SELECT id FROM admin_nav_items WHERE href = $1 LIMIT 1",
          [item.href]
        );
        if (existingRow.length > 0) {
          // Already exists somewhere (top-level, or under Content) — move it rather than
          // inserting a duplicate row.
          await client.query(
            "UPDATE admin_nav_items SET parent_id = $1, label = $2, display_order = $3, updated_at = now() WHERE id = $4",
            [layoutParentId, item.label, nextChildOrder, existingRow[0].id]
          );
        } else {
          await client.query(
            "INSERT INTO admin_nav_items (parent_id, label, href, display_order) VALUES ($1, $2, $3, $4)",
            [layoutParentId, item.label, item.href, nextChildOrder]
          );
        }
        nextChildOrder += 1;
      }
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getFlatAdminNavItems() {
  await ensureSeeded();
  const { rows } = await db.query(
    "SELECT * FROM admin_nav_items ORDER BY parent_id ASC NULLS FIRST, display_order ASC, id ASC"
  );
  return rows;
}

// Same shape AdminHeader.js/config/site.js's old `admin.nav` array used: top-level items are
// either {label, href} or {label, children: [{label, href}]}.
export async function getAdminNavTree() {
  const rows = await getFlatAdminNavItems();
  const topLevel = rows.filter((r) => r.parent_id === null);
  const childrenByParent = {};
  for (const row of rows) {
    if (row.parent_id === null) continue;
    (childrenByParent[row.parent_id] ??= []).push({ label: row.label, href: row.href });
  }
  return topLevel
    .map((item) => {
      const children = childrenByParent[item.id];
      if (children) return { label: item.label, children };
      return { label: item.label, href: item.href };
    })
    .filter((item) => item.children || item.href);
}

export async function createAdminNavItem({ parentId, label, href }) {
  await ensureSeeded();
  const { rows } = await db.query(
    "SELECT COALESCE(MAX(display_order), 0) + 1 AS next FROM admin_nav_items WHERE parent_id IS NOT DISTINCT FROM $1",
    [parentId || null]
  );
  await db.query(
    "INSERT INTO admin_nav_items (parent_id, label, href, display_order) VALUES ($1, $2, $3, $4)",
    [parentId || null, label, href || null, rows[0].next]
  );
}

export async function updateAdminNavItem(id, { label, href, displayOrder }) {
  await ensureSeeded();
  await db.query(
    "UPDATE admin_nav_items SET label = $1, href = $2, display_order = $3, updated_at = now() WHERE id = $4",
    [label, href || null, displayOrder ?? 0, id]
  );
}

export async function deleteAdminNavItem(id) {
  await ensureSeeded();
  await db.query("DELETE FROM admin_nav_items WHERE id = $1", [id]);
}
