# Team & People Internals

Build reference — extracted for reuse on another site.

Everything the site's "Meet our team" section and full `/team` roster do, admin panel through
public render, so it can be rebuilt on another site without re-deriving the design decisions. The
most relationally complex admin section in the codebase — a person is entered once, then assigned
to any number of teams, each membership carrying its own role, dates, and visibility. File paths
throughout are relative to a Next.js App Router project root.

**Source stack:** Next.js 16 (App Router) · React 19 · Postgres (`pg`) · Vercel Blob ·
`react-easy-crop` · Tailwind CSS v4

See also: [`hero-partners-about-gallery-internals.md`](./hero-partners-about-gallery-internals.md)
and [`site-content-sections-extended.md`](./site-content-sections-extended.md) for the rest of the
site's admin-editable content sections.

## Contents

- [Shared stack & conventions](#shared-stack--conventions)
- [1 · Data model](#1--data-model)
- [2 · Admin panel](#2--admin-panel)
- [3 · Public rendering](#3--public-rendering)
- [4 · File manifest](#4--file-manifest)
- [5 · Library reference](#5--library-reference)
- [6 · Porting checklist](#6--porting-checklist)

---

## Shared stack & conventions

Same three house rules this codebase's every other content section follows — worth restating
since they explain a lot of what looks, at first glance, like unnecessary indirection below.

### Pattern: lazy, additive schema — no migrations directory

Every feature module owns its own table via an `ensureTable()` call, run at the top of every
read/write function: `CREATE TABLE IF NOT EXISTS` for the base shape, then one
`ALTER TABLE ... ADD COLUMN IF NOT EXISTS` per field added later — `team_members` below is the
most-migrated table in the whole codebase because of this, and it's worth reading as a small case
study in what additive-only schema evolution looks like after several real feature additions.

### Pattern: Server Actions + targeted revalidation

Create/update/delete are plain `"use server"` functions passed straight to a `<form action=>`.
Every mutation here calls `revalidatePath()` on four routes at once — `/`, `/team`,
`/admin/team-members`, `/admin/team` — since a single membership change can affect the home page
preview, the full roster, and both admin lists simultaneously.

### Pattern: one upload helper, every image field

A person's photo goes through the exact same `ImageFileInput` → crop → compress → `uploadImage()`
pipeline as every other image in the app — nothing team-specific about it, so it isn't
re-documented here in full; the short version is in [§4](#4--file-manifest)'s file manifest.

---

## 1 · Data model

Three tables, not one. A **person** is entered once. A **team** is a named group with its own
visibility and current/former status. A **team_members** row is one person's *membership* on one
team — title, dates, active flag — not a copy of the person. This split is what lets the same
person sit on this year's Executive Committee and last year's (now Former) without re-entering
their name or re-uploading their photo.

```
people                        team_members                     teams
──────                        ────────────                     ─────
id (PK)      ←── person_id ── id (PK)          team_id ──→      id (PK)
name                          person_id → people                name, description
photo                         team_id → teams                   display_order
contact_no, email             title, dates                      show_on_home
id_no                         active, is_former                 is_former
                              show_on_home

1 person → N memberships                        N memberships → 1 team
```

### Schema — `people` table

```sql
-- lib/people.js
CREATE TABLE people (
  id SERIAL PRIMARY KEY,
  id_no VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  contact_no VARCHAR(50),
  email VARCHAR(255),
  photo VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

No unique constraint on `name` — two real people can genuinely share one (two members both named
"Mohammed Ahmed"), so it can't be a hard block. The admin form instead warns on submit: a
same-name match against every other person in the directory triggers a `confirm()` prompt
("already exists — create another anyway?") rather than silently sailing through, which is the
whole point of splitting people out in the first place — to stop an admin from accidentally
re-creating someone who already exists instead of reusing them.

### Schema — `teams` table

```sql
-- lib/teams.js
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  show_on_home BOOLEAN NOT NULL DEFAULT true,
  is_former BOOLEAN NOT NULL DEFAULT false,  -- whole committee's term ended
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Schema — `team_members` table (the join)

```sql
-- lib/teamMembers.js
CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  person_id INT REFERENCES people(id) ON DELETE CASCADE,
  team_id INT REFERENCES teams(id) ON DELETE CASCADE,
  title VARCHAR(255),                 -- this person's role on THIS team
  service_join_date DATE,
  service_end_date DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  show_on_home BOOLEAN NOT NULL DEFAULT true,
  is_former BOOLEAN NOT NULL DEFAULT false, -- left early, independent of the team flag
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`team_members` didn't start this shape — it used to *be* the person record (name/photo/contact
lived directly on it, one row per person per team with everything duplicated). A later migration
split people out; the old columns (`id_no`, `name`, `contact_no`, `email`, `photo`) are still on
the table — never dropped, additive-only schema — but no longer written to. A one-time,
advisory-lock-guarded backfill turns every pre-migration row into its own `people` row the first
time the table is touched post-migration.

> **Porting note:** skip this migration entirely on a fresh build. It only matters if you're
> inheriting an existing single-table `team_members` that predates a People split — build
> straight on the two-table `person_id`/`team_id` shape above otherwise.

### Logic — two independent "former" flags, deliberately

A member can be former because their *team's* term ended (`teams.is_former`) or because *they*
personally left early while their team is still current (`team_members.is_former`). Most of the
time only the team flag is ever touched — flip it once, the whole roster follows; the member flag
exists for the exception. Every query combines them with OR:

```sql
-- lib/teamMembers.js

-- "current" (full /team page's default view)
... WHERE t.is_former = false AND tm.is_former = false ...

-- "former" (the /team page's former-teams side nav)
... WHERE (t.is_former = true OR tm.is_former = true) ...

-- home page "Meet our team" — current AND opted into show_on_home, both levels
... WHERE tm.show_on_home = true AND tm.is_former = false
      AND t.show_on_home = true AND t.is_former = false ...
```

---

## 2 · Admin panel

Three separate routes, matching the three tables — deliberately not one combined "add a team
member" form, since a person and a membership have different lifecycles (a person might exist for
years across many teams; a membership is one term).

### Route — `/admin/people`, the person directory

Name, photo (standard crop pipeline), ID number, contact number, email. Nothing team-specific
lives here at all — this page would be identical on a site with no concept of teams, just a
people directory. The duplicate-name `confirm()` prompt described above lives in this form's
submit handler:

```jsx
// components/PersonForm.js
function handleSubmit(e) {
  const name = e.currentTarget.elements.name.value.trim().toLowerCase();
  const isDuplicate = existingNames.some((n) => n.trim().toLowerCase() === name);
  if (isDuplicate) {
    const proceed = window.confirm(
      `A person named "${name}" already exists. Create another anyway?`
    );
    if (!proceed) e.preventDefault();
  }
}
```

`existingNames` excludes the person currently being edited, so saving someone unchanged never
warns against themselves. Deleting a person cascades to every one of their team memberships
(`ON DELETE CASCADE`) — the confirm dialog says so before it happens.

### Route — `/admin/team`, teams themselves

Name, description, display order, and two checkboxes: **Show on home** (hide this whole team
from the home page preview without touching `/team`) and **Former team** (moves every member to
a "Former &lt;name&gt;" section regardless of each member's own flag — the
whole-committee-retires-together case).

### Route — `/admin/team-members`, the join, and its two real UI problems

Pick an existing person, pick a team, set the title/dates/order/flags for *that specific
membership*. Two things here are worth extracting on their own — a search combobox for the person
field, and a URL-persisted filter that survives the create/edit/delete round trip.

**PersonSelect — a type-to-search combobox with no dropdown library.** A plain `<select>` became
painful once the people directory grew past a handful of names. Rather than pull in a dependency
for one field, it's a small self-contained client component: a hidden input carries the real
`personId` the form submits, kept in sync with whichever option is clicked, so the surrounding
Server Action needs no changes at all.

```jsx
// components/PersonSelect.js

// type="hidden" inputs are excluded from HTML5 constraint validation —
// `required` lives on the visible text input instead, which only guarantees
// non-empty *text*, not a real selection. A typed-but-not-chosen value submits
// as an empty personId, caught server-side instead (readForm returns null;
// the action no-ops rather than saving a broken membership).
<input type="hidden" name={name} value={selectedId} />
<input
  type="text"
  value={query}
  onChange={handleChange}   // filters the list, clears selectedId
  onFocus={() => setOpen(true)}
  required={required}
/>
{open && (
  <ul>{filtered.map((person) => (
    <li><button onClick={() => choose(person)}>{person.name}</button></li>
  ))}</ul>
)}
```

**TeamMembersList — the filter lives in the URL, not in `useState`.** Picking "Executive
Committee" from the Filter by team dropdown, clicking Add member, saving, and landing back on the
*unfiltered* list is exactly the bug a plain `useState` filter produces — a full-page navigation
(the redirect after a Server Action) resets component state. The fix is to keep the filter in the
URL query string instead, and thread it through every link on the page:

```jsx
// components/TeamMembersList.js + team-members/actions.js

// list: reads ?team= via router.replace, not useState
function handleFilterChange(value) {
  const query = value === "all" ? "" : `?team=${encodeURIComponent(value)}`;
  router.replace(`/admin/team-members${query}`);
}
// every row's View/Edit link, and the "Add member" link, carry it forward:
function withFilter(href) {
  return teamFilter === "all" ? href : `${href}?team=${encodeURIComponent(teamFilter)}`;
}

// the create/edit/delete form carries it as a hidden field (returnTeam),
// and the action reads it back out to build the redirect target:
function redirectPath(formData, error) {
  const params = new URLSearchParams();
  const returnTeam = formData.get("returnTeam")?.toString();
  if (returnTeam) params.set("team", returnTeam);
  if (error) params.set("error", error);
  return `/admin/team-members?${params}`;
}
```

**The duplicate-membership guard** refuses a second *active* membership for the same person on
the same team — an application-level check (`hasActiveDuplicateMembership`), not a database
constraint, specifically so it can't take the whole table down if production already has an
unverifiable duplicate sitting in it. A blocked save redirects back with `?error=duplicate`,
rendered as a banner on the list page rather than a silent no-op:

```sql
-- lib/teamMembers.js
async function hasActiveDuplicateMembership(personId, teamId, excludeId) {
  const { rows } = await db.query(
    `SELECT id FROM team_members
     WHERE person_id = $1 AND team_id = $2 AND active = true AND id IS DISTINCT FROM $3
     LIMIT 1`,
    [personId, teamId, excludeId || null]
  );
  return rows.length > 0;
}
```

Status badges on the list — `Inactive`, `Former`, `Home` — are computed inline from the same
three flags (`active`, `is_former`, `show_on_home`) rather than a single derived "status" column,
so the underlying booleans stay the single source of truth every query above reads directly.

---

## 3 · Public rendering

Two surfaces, deliberately different strictness: the full `/team` roster shows every active,
non-former member regardless of "Show on home"; the home page preview is the strictest of every
query in this doc.

### Render — `components/TeamRoster.js`, current/former switcher

Client component, fed pre-grouped data from the server (`getCurrentTeamsWithMembers()` /
`getFormerTeamsWithMembers()`, both already shaped as `[{ id, name, members: [...] }]`). A
sidebar nav (collapsible toggle on mobile instead of a permanent rail) lets a visitor jump
straight to one current team or one former team's roster instead of scrolling past every other
group first — but *only appears at all* once there's something to switch between:

```jsx
// components/TeamRoster.js
const hasFormerTeams = formerTeams.length > 0;
const showCurrentSubList = currentTeams.length > 1;
const showNav = hasFormerTeams || showCurrentSubList;
// a site with exactly one current team and no former ones renders as a
// plain single roster, no nav chrome at all — same "don't show UI with
// nothing to switch to" instinct as Hero's single-slide carousel.
```

`getFormerTeamsWithMembers()` only ever returns a group for a team that *actually has* at least
one effectively-former member (whole team retired, or one person left early) — a team with zero
former members produces no group, so the nav never offers an empty "Former X" view with nothing
in it.

### Render — home page "Meet our team", the strictest query, and a known duplication

The home page block requires `show_on_home = true` AND non-former at *both* the team level and
the member level (see the SQL in [§1](#1--data-model)) — belt-and-suspenders: an admin would
normally also flip a team's own "Show on home" off, but the home page should never show a former
committee regardless of whether that step was missed.

> **Worth knowing before you port this:** `app/page.js`'s home page card markup (photo circle,
> name, role pill) is an inline copy of `TeamRoster.js`'s `MemberCard`, not an import of it — the
> two have drifted into being pixel-identical by discipline, not by sharing code. A clean port
> should extract one shared `MemberCard` component up front rather than carrying the duplication
> forward.

---

## 4 · File manifest

| File | Role |
|---|---|
| `lib/people.js` | Person directory — schema, CRUD (photo through the shared upload pipeline) |
| `lib/teams.js` | Team schema + CRUD |
| `lib/teamMembers.js` | The join table — CRUD, duplicate-membership guard, the three grouped queries, legacy backfill |
| `app/admin/(protected)/people/*` | List / new / edit / actions.js |
| `app/admin/(protected)/team/*` | List / new / edit / actions.js |
| `app/admin/(protected)/team-members/*` | List / new / edit / actions.js — the URL-filter + returnTeam plumbing |
| `components/PersonForm.js` | Person admin form — the duplicate-name `confirm()` |
| `components/TeamForm.js` | Team admin form |
| `components/TeamMemberForm.js` | Membership admin form — wraps PersonSelect |
| `components/PersonSelect.js` | Type-to-search person combobox, no dropdown library |
| `components/TeamMembersList.js` | Admin list — URL-persisted team filter, status badges |
| `app/team/page.js` | Public roster page — server-fetches current + former groups |
| `components/TeamRoster.js` | Public render — current/former sidebar switcher |
| `app/page.js` | "Meet our team" home page preview block (currently a duplicate of TeamRoster's card markup — see callout above) |

---

## 5 · Library reference

Nothing new here beyond what the rest of the app already uses — worth confirming explicitly,
since the search combobox and the current/former switcher both look like places a library would
normally show up.

| Package | Used for | Version |
|---|---|---|
| `@tabler/icons-react` | Users/History/Menu/Chevron icons in TeamRoster's nav, search icon in PersonSelect. | ^3.46.0 |
| `pg` | Raw SQL — the grouped current/former/home queries in lib/teamMembers.js are all hand-written joins. | ^8.23.0 |
| `next` | App Router, Server Actions, revalidatePath, useRouter (TeamMembersList's URL-filter navigation). | 16.3.0 |
| `react` / `react-dom` | PersonSelect's combobox state and TeamRoster's view-switching — plain hooks. | 19.2.8 |
| `tailwindcss` | All layout/styling. | ^4 |

No combobox/autocomplete library (downshift, react-select, cmdk) for PersonSelect, no
state-management library for the URL-persisted filter — plain `useRouter().replace()` and search
params carry it instead of Redux/Zustand/URL-state libraries.

---

## 6 · Porting checklist

1. **People first, standalone** — Port `lib/people.js` + its admin CRUD + `ImageFileInput` and
   confirm it works as a plain, team-agnostic directory before touching Teams at all.
2. **Teams next, still standalone** — Port `lib/teams.js` + admin CRUD. No dependency on People
   yet — a team is just a named group until Team Members links the two.
3. **Team Members — the join, plus PersonSelect and the URL-filter list** — This is the one with
   real complexity: port `lib/teamMembers.js` (skip the legacy backfill on a fresh build, see the
   note in §1), then `PersonSelect.js`, then `TeamMembersList.js`'s URL-filter + returnTeam
   plumbing together — the list and the form/action layer are one unit.
4. **Public render — extract MemberCard once, not twice** — Build one shared card component up
   front and use it from both `TeamRoster.js` and the home page block — don't carry forward this
   codebase's copy-pasted version (see the callout in §3).
5. **Route-protection allowlist** — If the target site has centralized middleware/route-guard,
   remember `/admin/people`, `/admin/team`, and `/admin/team-members` all need adding there — same
   gotcha as every other admin route.

---

*Team & People internals — reference doc, portable to any Next.js + Postgres + Vercel Blob
project.*
