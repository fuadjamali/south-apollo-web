import { db } from "@/lib/db";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { localizeFields, mergeTranslationSql } from "@/lib/i18n/localize";

// Header nav menu — used to live as a hardcoded array in config/site.js. One row per item;
// `parent_id` set means the row is a child link inside a dropdown group (SiteHeader.js only
// renders one level of nesting, so a child row can't have its own children). `cta`/`highlight`
// only apply to top-level items (SiteHeader.js ignores them on children).
const NAV_SEED_LOCK_KEY = "south_apollo_web:nav_items";

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS nav_items (
      id SERIAL PRIMARY KEY,
      parent_id INT REFERENCES nav_items(id) ON DELETE CASCADE,
      label VARCHAR(100) NOT NULL,
      href VARCHAR(255),
      cta BOOLEAN NOT NULL DEFAULT false,
      highlight BOOLEAN NOT NULL DEFAULT false,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Other-language labels, { bn: { label } } — see lib/i18n/localize.js. Added after the table
  // shipped; runs inside ensureSeeded's advisory-locked transaction like the CREATE above.
  await client.query(
    `ALTER TABLE nav_items ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb`
  );
}

// Same menu that used to live in config/site.js's `nav` array — the seed values, not
// placeholders.
const DEFAULT_NAV = [
  {
    label: "About",
    children: [
      { label: "About Us", href: "#about" },
      { label: "Vision & Mission", href: "#vision-mission" },
      { label: "History", href: "#history" },
      { label: "How It Works", href: "#how-it-works" },
    ],
  },
  {
    label: "Explore",
    children: [
      { label: "Products", href: "#products" },
      { label: "Portfolio", href: "#portfolio" },
      { label: "Gallery", href: "/gallery" },
      { label: "Blog", href: "/blog" },
      { label: "News & Events", href: "/news-events" },
    ],
  },
  {
    label: "Company",
    children: [
      { label: "Team", href: "/team" },
      { label: "Reviews", href: "#reviews" },
      { label: "Certifications", href: "#certifications" },
      { label: "Membership", href: "/membership" },
    ],
  },
  {
    label: "Contact",
    children: [
      { label: "Send an Enquiry", href: "#enquiry" },
      { label: "Contact Info", href: "#contact-info" },
    ],
  },
  { label: "Plans", href: "#plans", highlight: true },
  { label: "Book Now", href: "/booking", cta: true },
];

// Seeds the default nav inside the same locked transaction as ensureTable, so concurrent
// first-time callers (e.g. every page rendering SiteHeader during `next build`) can't race each
// other the way a bare "CREATE TABLE IF NOT EXISTS" + "SELECT COUNT then INSERT" would — see
// lib/sectionHeadings.js's ensureTable comment for the failure mode this avoids. Holding
// pg_advisory_xact_lock across both the create and the seed check serializes every caller onto
// one winner; everyone else sees the table (and rows) already committed.
async function ensureSeeded() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [NAV_SEED_LOCK_KEY]);
    await ensureTable(client);
    const { rows } = await client.query("SELECT COUNT(*)::int AS count FROM nav_items");
    if (rows[0].count === 0) {
      let order = 0;
      for (const item of DEFAULT_NAV) {
        order += 1;
        const {
          rows: [parent],
        } = await client.query(
          "INSERT INTO nav_items (label, href, cta, highlight, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING id",
          [item.label, item.href || null, !!item.cta, !!item.highlight, order]
        );
        if (item.children) {
          let childOrder = 0;
          for (const child of item.children) {
            childOrder += 1;
            await client.query(
              "INSERT INTO nav_items (parent_id, label, href, display_order) VALUES ($1, $2, $3, $4)",
              [parent.id, child.label, child.href, childOrder]
            );
          }
        }
      }
    } else {
      // Migration: Vision & Mission and History shipped after nav_items was already seeded on
      // existing deployments (this one included) — the block above only runs once, on a
      // brand-new empty table, so it never sees these two. Backfill them into the "About" group
      // by href, which is safe to run on every call: ON CONFLICT-free (hrefs aren't unique) so
      // it checks existence first, and won't re-add one an admin has since deleted on purpose —
      // this only ever fires while both are still missing.
      const { rows: existing } = await client.query(
        "SELECT href FROM nav_items WHERE href IN ('#vision-mission', '#history')"
      );
      const have = new Set(existing.map((r) => r.href));
      const missing = [
        { label: "Vision & Mission", href: "#vision-mission" },
        { label: "History", href: "#history" },
      ].filter((item) => !have.has(item.href));
      if (missing.length > 0) {
        const {
          rows: [aboutParent],
        } = await client.query(
          "SELECT id FROM nav_items WHERE parent_id IS NULL AND label = 'About' LIMIT 1"
        );
        if (aboutParent) {
          const {
            rows: [{ next }],
          } = await client.query(
            "SELECT COALESCE(MAX(display_order), 0) + 1 AS next FROM nav_items WHERE parent_id = $1",
            [aboutParent.id]
          );
          let order = next;
          for (const item of missing) {
            await client.query(
              "INSERT INTO nav_items (parent_id, label, href, display_order) VALUES ($1, $2, $3, $4)",
              [aboutParent.id, item.label, item.href, order]
            );
            order += 1;
          }
        }
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

// Flat rows ordered for both admin editing (needs parent_id to group) and tree assembly.
export async function getFlatNavItems() {
  await ensureSeeded();
  const { rows } = await db.query(
    "SELECT * FROM nav_items ORDER BY parent_id ASC NULLS FIRST, display_order ASC, id ASC"
  );
  return rows;
}

// Same shape SiteHeader.js/config/site.js's old `nav` array used: top-level items are either
// {label, href, cta, highlight} or {label, children: [{label, href}]}. A group with no children
// left (all deleted) is dropped rather than rendered as an empty dropdown.
export async function getNavTree(locale = DEFAULT_LOCALE) {
  const rows = (await getFlatNavItems()).map((row) => localizeFields(row, locale, ["label"]));
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
      return { label: item.label, href: item.href, cta: item.cta, highlight: item.highlight };
    })
    .filter((item) => item.children || item.href);
}

export async function createNavItem({ parentId, label, labelBn, href, cta, highlight }) {
  await ensureSeeded();
  const { rows } = await db.query(
    "SELECT COALESCE(MAX(display_order), 0) + 1 AS next FROM nav_items WHERE parent_id IS NOT DISTINCT FROM $1",
    [parentId || null]
  );
  await db.query(
    `INSERT INTO nav_items (parent_id, label, href, cta, highlight, display_order, translations)
     VALUES ($1, $2, $3, $4, $5, $6, jsonb_build_object('bn', jsonb_build_object('label', $7::text)))`,
    [parentId || null, label, href || null, !!cta, !!highlight, rows[0].next, labelBn || ""]
  );
}

// displayOrder is deliberately not a param here — order is now set exclusively via
// setNavItemOrder() (drag-and-drop/up-down in the admin UI), so an ordinary label/href/cta edit
// never touches it, and can't accidentally reset it to 0 by omitting a field.
export async function updateNavItem(id, { label, labelBn, href, cta, highlight }) {
  await ensureSeeded();
  await db.query(
    `UPDATE nav_items SET label = $1, href = $2, cta = $3, highlight = $4,
       ${mergeTranslationSql("$6", "$7")}, updated_at = now()
     WHERE id = $5`,
    [label, href || null, !!cta, !!highlight, id, "bn", JSON.stringify({ label: labelBn || "" })]
  );
}

export async function deleteNavItem(id) {
  await ensureSeeded();
  await db.query("DELETE FROM nav_items WHERE id = $1", [id]);
}

// Persists a full drag-and-drop reorder in one go — `orderedIds` is every sibling under
// `parentId` (null for top-level), in their new order. Runs as one transaction on a dedicated
// client (not db.query() per row, which could each land on a different pooled connection and
// wouldn't actually be atomic) so a page reload mid-drag can never show a half-applied order.
// The `parent_id IS NOT DISTINCT FROM` guard means a ghost id from a stale client (already
// deleted, or moved to a different parent by another admin) is silently skipped rather than
// corrupting order across groups.
export async function setNavItemOrder(parentId, orderedIds) {
  await ensureSeeded();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < orderedIds.length; i++) {
      await client.query(
        "UPDATE nav_items SET display_order = $1, updated_at = now() WHERE id = $2 AND parent_id IS NOT DISTINCT FROM $3",
        [i + 1, orderedIds[i], parentId ?? null]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
