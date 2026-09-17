# Site Content Sections — Extended Reference

Companion to [`hero-partners-about-gallery-internals.md`](./hero-partners-about-gallery-internals.md)
(Hero, Partners, About, Gallery) — same method, covering every other admin-editable home page
section: what it's for, its schema, what's actually distinctive about its admin panel or render,
and where it deviates from the base pattern. File paths are relative to a Next.js App Router
project root; the shared conventions (lazy `ensureTable()` schema, Server Actions + targeted
`revalidatePath()`, the `lib/blob.js` upload pair) are documented in Part 1 and apply here
unchanged — this doc only calls them out again where a section does something extra.

## Contents

- [1 · Vision & Mission and History — About's free siblings](#1--vision--mission-and-history--abouts-free-siblings)
- [2 · Blog & News and Events — the slugged list/detail pattern](#2--blog--news-and-events--the-slugged-listdetail-pattern)
- [3 · Team — People, Teams, and Team Members](#3--team--people-teams-and-team-members)
- [4 · The plain-list pattern — Reviews, Testimonials, How It Works, Stats, Certifications, Portfolio](#4--the-plain-list-pattern--reviews-testimonials-how-it-works-stats-certifications-portfolio)
- [5 · Porting notes](#5--porting-notes)

---

## 1 · Vision & Mission and History — About's free siblings

Already fully documented in Part 1's [About section](./hero-partners-about-gallery-internals.md#3--about)
— worth calling out on its own only because porting these two costs *nothing extra* once About is
ported. Both are literally the same two files (`components/ImageTextSectionForm.js` +
`components/ImageTextSection.js`) pointed at a different singleton table:

| | Table | Default `image_position` | `allowBehindPosition` | Renders once... |
|---|---|---|---|---|
| About | `about_info` | `left` | ✅ (only caller that sets it) | always (`hidesWhenBodyEmpty={false}`) |
| Vision & Mission | `vision_mission_info` | `left` | ❌ | `body` has been written |
| History | `history_info` | `right` | ❌ | `body` has been written |

Vision & Mission and History both default to *off* (see `lib/moduleSettings.js`'s seed) and stay
invisible even once switched on until an admin actually writes a body — a client who enables the
module before filling it in gets nothing rather than an empty heading. The content-shape parsers
in `ImageTextSection.js` (`splitMissionVision`, `parseTimeline`, `parseFeatureList`) exist
specifically because of these two: Vision & Mission's natural shape is
`"Our Mission … Our Vision …"` (two cards), History's is a run of dated paragraphs (a timeline).
Both are covered in Part 1 — nothing to add here beyond the table above.

---

## 2 · Blog & News and Events — the slugged list/detail pattern

The one pattern in this doc with real public routing: a list page, a detail page per row, and a
"recent N" slice embedded on the home page. Blog and News & Events are near-identical — News &
Events adds a `type` (News/Event) split and event-specific fields on top of the same shape.

### Schema

```sql
-- lib/blog.js
CREATE TABLE blog_posts (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  body TEXT,
  image VARCHAR(500),
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- lib/newsEvents.js — same shape, plus:
--   type VARCHAR(10) NOT NULL DEFAULT 'News' CHECK (type IN ('News', 'Event'))
--   summary TEXT, description TEXT   (excerpt/body renamed + split)
--   event_date DATE, event_location VARCHAR(255)   (only meaningful when type = 'Event')
```

### Slug generation

Both modules generate the slug from the title rather than asking an admin to type one — one
shared recipe, implemented twice (small enough not to bother extracting):

```js
export function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "post";
}

// appends -2, -3, ... until free. Bounded loop — fine for low-volume content,
// not built to survive two simultaneous creates racing on the same title.
async function uniqueSlug(base, excludeId) {
  let slug = base, suffix = 2;
  while (true) {
    const taken = await slugExists(slug, excludeId);
    if (!taken) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}
```

A retitle on edit regenerates the slug (`uniqueSlug(slugify(title), id)`, excluding the row's own
id from the collision check) — old links break on a retitle, which is the deliberate tradeoff for
never having a URL that doesn't match the current title. Neither module does anything to redirect
an old slug.

### Admin

Standard list/new/edit/delete, same shape as Hero's list minus the reorder (both sort purely by
`published_date DESC, id DESC` — no `display_order` column, since "most recent first" is the only
order that makes sense for dated content). News & Events' form additionally shows/hides the
event-date and location fields based on the `type` radio, client-side.

### Public routes

- `/blog`, `/blog/[slug]` and `/news-events`, `/news-events/[slug]` — full list + detail pages,
  each with proper `generateMetadata()` (see `lib/seo.js`'s `buildPageMetadata` if you've also
  read the SEO work covered elsewhere in this repo's history — these two are exactly what that
  helper was built for).
- Home page shows the latest 3 of each (`getRecentPosts(3)` / `getRecentItems(3)`) as preview
  cards, gated on the module being enabled at all, with a "View all" link to the full list page.

### File manifest

| File | Role |
|---|---|
| `lib/blog.js` | Schema, CRUD, slug generation, recent/all/by-slug queries |
| `lib/newsEvents.js` | Same shape + `type`/event fields |
| `app/admin/(protected)/blog/*`, `.../news-events/*` | List / new / edit / actions.js |
| `app/blog/page.js`, `app/blog/[slug]/page.js` | Public list + detail |
| `app/news-events/page.js`, `app/news-events/[slug]/page.js` | Public list + detail (adds the News/Event type badge) |
| `app/page.js` | "Recent posts" / "News & Events" home page preview blocks |

---

## 3 · Team — People, Teams, and Team Members

The most relationally complex of these sections — complex enough to have its own dedicated
write-up. See **[`team-people-internals.md`](./team-people-internals.md)** for the full
treatment: the three-table schema (`people` / `teams` / `team_members`) with an ER diagram, the
two independent "former" flags and the exact SQL each query combines them with, the legacy
single-table migration and its one-time backfill, and the two genuinely reusable pieces —
the `PersonSelect` type-to-search combobox (no dropdown library) and the URL-persisted team
filter that survives the admin's create/edit/delete redirect round trip.

A person is entered once in `people`, then assigned to any number of teams via `team_members` —
a pure join row (title, dates, active/former flags for *that* membership) rather than a copy of
the person, which is what lets the same person sit on this year's committee and last year's
(now Former) without re-entering their name or re-uploading their photo. The public `/team`
page has a current/former switcher (`components/TeamRoster.js`); the home page preview and the
full roster share one `components/MemberCard.js` rather than two independently-maintained copies
of the same markup.

---

## 4 · The plain-list pattern — Reviews, Testimonials, How It Works, Stats, Certifications, Portfolio

Six sections, one shape: `id`, a handful of plain fields, `display_order`, timestamps — no slug, no
detail page, admin-reorderable via a plain number field (same reasoning as Partners in Part 1: a
handful of rows changes rarely enough that a number field is less UI than drag-and-drop for the
same result). Documenting the shape once, then what's actually different about each.

```sql
-- the shape every one of these six tables follows
CREATE TABLE <table> (
  id SERIAL PRIMARY KEY,
  -- 1-3 plain content fields (see table below) --
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

```sql
-- the query every one of them is read with, verbatim
SELECT * FROM <table> ORDER BY display_order ASC, id ASC
```

| Section | Table | Content fields | Image? | Admin route | Home render |
|---|---|---|---|---|---|
| Reviews | `reviews` | `platform_name`, `rating`, `review_count`, `url` | logo (optional) | `/admin/reviews` | Row of clickable platform badges (rating + count), linking out to `url` |
| Certifications | `certifications` | `name` | badge image (optional) | `/admin/certifications` | Row of logo badges |
| Portfolio | `portfolio_items` | `name`, `description` | **required** | `/admin/portfolio` | Image grid/gallery |
| How It Works | `how_it_works_steps` | `title`, `description` | — | `/admin/how-it-works` | Numbered step cards |
| Stats | `stats` | `value`, `label` | — | `/admin/stats` | Dark "credentials" band, 2/4-column stat tiles |
| Testimonials | `testimonials` | see below — the one real exception | — | `/admin/testimonials` | Approved quotes only |

**Reviews** is read through a `toPublicShape()` mapper that renames `platform_name`→`name`,
`review_count`→`count` — kept because the home page's render code predates the Postgres migration
and still expects those field names; a fresh port has no reason to keep the rename, it's an
artifact of this specific codebase's history rather than a pattern worth copying.

**Testimonials is the one section here that isn't a simple admin-authored list** — it's
public-submitted and admin-moderated, which changes its shape enough to be worth its own schema:

```sql
CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),               -- admin-only, never in the public query
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  member_account_id INT REFERENCES members(id) ON DELETE SET NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- `submitTestimonial()` is called from a public route (a logged-in member leaving a review),
  always lands as `Pending`, and is invisible on the site until an admin flips it to `Approved` —
  there's no "edit content" admin action here, only a status change (plus reordering the approved
  ones).
- Two separate read functions enforce the visibility split structurally rather than by convention:
  `getTestimonials()` (admin, everything, pending surfaced first) vs.
  `getApprovedTestimonials()` (public, `status = 'Approved'` only, explicitly excludes
  `author_email` from the `SELECT` rather than just not rendering it — so a leaked template or a
  future careless render can't accidentally expose it).
- `getTestimonialStats()` computes a live average rating across approved testimonials — real,
  non-curated social proof sitting alongside the manually-entered third-party platform ratings from
  Reviews.

### File manifest

| File | Role |
|---|---|
| `lib/reviews.js`, `lib/certifications.js`, `lib/portfolio.js`, `lib/howItWorks.js`, `lib/stats.js` | Five near-identical plain-list modules — schema + CRUD, table above covers what differs |
| `lib/testimonials.js` | Public submission + admin moderation — the one exception |
| `app/admin/(protected)/{reviews,certifications,portfolio,how-it-works,stats,testimonials}/*` | One admin CRUD route per section |
| `app/page.js` | Each section's home page render block |

---

## 5 · Porting notes

- **Order to port in, if taking all of this on top of Part 1's four sections:** the five plain-list
  modules first (fastest — copy the shape, swap field names), then Blog/News & Events (needs the
  slug helper), then Team last (the only one with real relational structure — get People working
  as its own thing before wiring Teams/Team Members on top of it; see
  [`team-people-internals.md`](./team-people-internals.md) for the detailed porting checklist).
- **Testimonials needs `members`** (a real accounts table with login) to exist first if you want
  the public-submission flow — `member_account_id` is a real foreign key, not optional plumbing.
  Porting just the admin-authored-and-approved half (skip public submission, seed `Approved` rows
  directly) sidesteps that dependency entirely if the target site has no membership system.
- **Every image field in every section above** (Reviews' logo, Portfolio's required image,
  Certifications' badge, a person's photo) goes through the exact same
  `ImageFileInput` → crop → compress → `uploadImage()` pipeline documented in Part 1's
  [§5](./hero-partners-about-gallery-internals.md#5--shared-image-pipeline) — nothing new to port
  for any of them once that pipeline exists.

---

*Site content sections — extended reference, Part 2 of 3. See
[`hero-partners-about-gallery-internals.md`](./hero-partners-about-gallery-internals.md) (Part 1)
for Hero, Partners, About, and Gallery, and
[`team-people-internals.md`](./team-people-internals.md) (Part 3) for the full Team & People
write-up.*
