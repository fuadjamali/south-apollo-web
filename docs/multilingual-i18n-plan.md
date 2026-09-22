# Multilingual (EN / BN) — Discussion Plan

Not started — this is a proposal to discuss and amend before any code changes, following the
same "share plan → amend → approve → implement" process used for every other feature this
project has taken on. Two decisions below are still open; everything else follows from them.

## The goal

English + Bengali (Bangla) to start, with a visible switcher so a visitor can pick their
language. Covers two distinct things that need different treatment:

- **Content** — admin-entered text living in Postgres (product descriptions, blog posts, Hero
  headings, About/Vision & Mission/History, etc.).
- **Interface** — hardcoded UI strings scattered across components (button labels, nav items,
  "Save"/"Cancel", validation/error messages).

## Open decision 1 — how locale shows up in the URL

| Option | How it works | Tradeoff |
|---|---|---|
| **Path-prefix** (`/en/products`, `/bn/products`) — *recommended* | Every route nests under `app/[locale]/...`, Next's own recommended App Router i18n pattern | Each language gets a real, indexable, shareable URL — good SEO, matches the canonical-URL/structured-data work already done. Cost: every existing route moves one level deeper — a real, mechanical refactor of the whole `app/` tree, not just an add |
| **Cookie/session-based**, no URL change | Locale stored client-side, same URL serves either language | Nothing to restructure, quick to bolt on. Cost: one URL serving two languages confuses search crawlers, no way to link someone straight to the Bengali version of a page |

Leaning path-prefix given the SEO investment already made elsewhere in this project, but it's the
more invasive option of the two — worth confirming before touching routing.

## Open decision 2 — where translated content lives

This codebase's whole convention is one Postgres table per feature, plain columns, additive
`ALTER TABLE ... ADD COLUMN IF NOT EXISTS` — no ORM, no migrations directory. Three ways to fit
translations into that:

| Approach | Shape | Fit here |
|---|---|---|
| Column-per-locale (`heading_en`, `heading_bn`) | Literal columns | Simple, but doubles every text field in every admin form, and a 3rd language later means another migration on every table |
| **JSONB overlay column** — *recommended* | Existing columns stay English (the default); one new `translations JSONB NOT NULL DEFAULT '{}'` column per table holds `{ "bn": { "heading": "...", ... } }` | One additive column per table — matches the existing pattern exactly. Scales to more languages with zero further schema changes. A missing translation just falls back to English |
| Generic translations table (`table_name, row_id, locale, field, value`) | One shared table for every feature | The "textbook i18n" shape, but every content read needs a join/lookup — a real detour from this codebase's plain-SQL-per-feature style |

Recommendation: the JSONB overlay, with one small shared helper —

```js
// lib/i18n.js (sketch)
export function t(row, field, locale) {
  return row.translations?.[locale]?.[field] || row[field];
}
```

— covering every table without per-table translation logic.

## Interface strings

This project has deliberately avoided pulling in a library anywhere it could hand-roll something
instead (no carousel/masonry/lightbox library anywhere in the codebase). Same instinct applies
here: a small `lib/i18n/en.json` + `lib/i18n/bn.json` dictionary and a `t(key)` helper, rather
than `next-intl`/`react-i18next`. Plenty for the ~100-200 UI strings this app actually has; if
real pluralization/ICU formatting is ever needed, upgrading to a library later is a contained
swap, not a rewrite.

Two things to flag going in:

- **Font.** The site currently uses `Arial, Helvetica, sans-serif` (`app/globals.css`) — none of
  those render Bengali script. Bengali needs a real Bengali-supporting font (e.g. Noto Sans
  Bengali), loaded when `locale=bn`.
- **`lib/siteText.js` / `lib/sectionHeadings.js`** are already admin-editable Postgres content,
  not hardcoded strings — they go through the JSONB-overlay content approach above, not the
  interface dictionary.

## Rollout — phased, not big-bang

Roughly 20+ content tables and 100+ scattered UI strings exist in this app today; not a
one-sitting change.

1. **Infrastructure** — locale routing/switching, the `t()` content helper, the interface
   dictionary, a `<LanguageSwitcher>` component, locale persisted in a cookie.
2. **Highest-visibility first** — Hero, Nav, section headings, About/Vision & Mission/History,
   and the site-wide interface strings (nav labels, buttons, footer).
3. **Everything else, one table at a time** — Products, Gallery, Blog, News & Events, Team,
   Reviews, Partners — same "share plan → approve → implement" cadence used for every other
   feature, not one giant change.

## Admin UX sketch

Each translatable field gets a collapsed "Bengali" section directly under it in the admin form —
defaults closed, and leaving it blank just falls back to English on the public site. No admin is
forced to translate everything on day one; a half-translated site is a valid, working state
throughout the rollout, not a broken intermediate one.

---

*Discussion note — nothing here is decided or built. Revisit and amend before starting.*
