# Developer Notes

Operational reference for whoever maintains this codebase or spins up a new client site —
env vars, the pricing-tier system, deployment steps, and where things live. `README.md`
covers first-time local setup; this file covers everything past that.

## Stack

- Next.js 16 (App Router) + React 19
- PostgreSQL (Docker locally, Neon Postgres in production via Vercel)
- Auth.js (NextAuth) for **admin** login — Credentials provider, JWT sessions
- A separate custom HMAC-signed cookie for **member** login (see "Two separate auth systems" below)
- Vercel Blob for all uploaded images (products, gallery, team photos, logos, etc.)
- Tailwind CSS v4, 8 built-in color themes (light/dark aware)

## Environment variables

Every one of these is set **per Vercel project** — each client gets their own deployment, so
each client's project has its own copy of all of these, not shared.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string (Neon in production, local Docker in dev) |
| `NEXTAUTH_SECRET` | Yes | Signs admin session JWTs. Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Canonical site URL (`https://client-domain.com` in production) |
| `BLOB_READ_WRITE_TOKEN` | Yes, if any image upload feature is used | Vercel Blob store token — auto-populated once a Blob store is connected to the project |
| `MEMBER_AUTH_SECRET` | Recommended | Signs member session cookies. Falls back to `NEXTAUTH_SECRET` if unset, but set a distinct value in production for real separation between the two auth systems |
| `PLAN` | Recommended | `basic` \| `plus` \| `premium` — see below. Unset defaults to `premium` (everything enabled) |
| `ANTHROPIC_API_KEY` | Optional fallback | Claude API key powering "Write with AI" (Plus/Premium) — can be set here, or self-serve by an admin at `/admin/ai-settings` (which takes priority). Neither set: feature shows a clear inline error, not a crash |

`.env.example` and `.env.local.example` at the repo root mirror this table with inline
comments — keep both in sync if this list changes.

## Plan tiers (`PLAN` env var)

Each deployment is gated to a pricing tier via a single `PLAN` env var, enforced in
`lib/plan.js`. This is real route-level enforcement (checked in `proxy.js` on every request),
not just hiding nav links — a module outside the plan returns 401 "Site Unavailable" even if
someone guesses the direct URL or isn't logged in as the client.

### Where to set it

- **Local testing**: `.env.local` → `PLAN=basic` (or `plus`/`premium`). Dev server auto-restarts
  on `.env.local` changes.
- **Before deploying a client's site**: that client's Vercel project → **Settings →
  Environment Variables** → add `PLAN` scoped to at least Production. Or via CLI:
  `npx vercel env add PLAN production`.
- Changing `PLAN` on an already-deployed project needs a redeploy to take effect (env vars are
  read at build/runtime start, not live).
- Unset defaults to `premium` — deliberately set it even for Premium clients so it's explicit,
  not "happens to be permissive by default."

### What each tier includes

Cumulative — Plus includes everything Basic has, Premium includes everything Plus has.

| Module | Basic | Plus | Premium |
|---|:---:|:---:|:---:|
| Home, about, stats, how-it-works, map, contact info, enquiry form | ✅ | ✅ | ✅ |
| Products / Portfolio (choose one at onboarding via `config/site.js`, not code-gated) | ✅ | ✅ | ✅ |
| Blog, Gallery, News & Events | — | ✅ | ✅ |
| Reviews, Partners strip | — | ✅ | ✅ |
| Team & Team Members, Certifications | — | ✅ | ✅ |
| Full 8-theme switcher (Basic is locked to one fixed theme) | — | ✅ | ✅ |
| "Write with AI" admin content assistant (needs `ANTHROPIC_API_KEY`) | — | ✅ | ✅ |
| Booking & scheduling (`/booking`, real-time slot calendar) | — | ✅ | ✅ |
| Shopping cart, checkout, order management | — | — | ✅ |
| Member login portal, membership verification | — | — | ✅ |

### How it works internally

- `lib/plan.js` exports `PLAN`, `isModuleEnabled(name)`, `getEffectiveSiteConfig(config)`,
  `isAdminPathEnabled(pathname)`, `isPublicPathEnabled(pathname)`, `isNavItemEnabled(href)`.
- `app/page.js` calls `getEffectiveSiteConfig(siteConfig)` once, which nulls out any section
  belonging to a disabled module — every section already renders behind a
  `{section && (...)}` check (the existing "set to null to remove this section" convention),
  so gating doesn't touch any JSX beyond that one call.
- `proxy.js` checks `isPublicPathEnabled`/`isAdminPathEnabled` before its normal
  auth/route-allowlist logic, so a gated route 401s regardless of session state.
- `app/admin/(protected)/layout.js` filters `config/site.js`'s `admin.nav` through
  `isNavItemEnabled` before rendering — an admin nav group with every child gated (e.g.
  "People" on Basic) disappears entirely rather than showing empty.
- The current plan shows as a colored badge in the admin header, next to "Admin" — reads the
  same `PLAN` value, so it can't drift out of sync with what's actually enforced.

**Known simplification**: Products and Portfolio are never module-gated in code — a Basic
client gets whichever one is enabled via the existing `config/site.js` null-toggle (a content
decision at onboarding), not a hard per-module split. Not worth the added complexity for two
near-identical showcase types.

**Watch out for prefix-matching bugs when adding new gated routes.** Two were found and fixed
during testing: `/admin/member-resets` does *not* start with `/admin/members` as a string
(diverges at `s` vs `-`), and anchor-only nav items like `#reviews` can't be matched by URL
prefix at all — they need an explicit entry in `lib/plan.js`'s `ANCHOR_MODULES` map. If you add
a new gated section, verify with `curl`, don't just eyeball the prefix list.

## Booking & scheduling

`/booking` is a real-time slot calendar, gated to Plus/Premium (`isModuleEnabled("booking")`):

- **One shared calendar for the whole business** — not per-service, not per-staff-member. A
  booked slot blocks that time for every service, since the assumption is one small business
  can only serve one customer at a time. `lib/bookings.js`'s `getAvailableSlots()` checks
  conflicts across *all* bookings on that date, not just the requested service.
- Admin sets weekly recurring hours at `/admin/availability` (`lib/availability.js`,
  `availability_windows` table: `day_of_week` 0–6, `start_time`, `end_time`) — as many windows
  per day as needed (e.g. split morning/afternoon).
- Admin manages bookable services at `/admin/booking-services` (`lib/bookingServices.js`) —
  name, description, duration, price label, image, active toggle, display order. Duration
  controls the slot grid: a 45-min service offers slots every 45 minutes within each window.
- Slots are computed on request, not stored — `getAvailableSlots(serviceId, dateStr)` walks
  that day's windows in `duration_minutes` steps, drops any step overlapping an existing
  non-cancelled booking, and drops past times if the date is today.
- Public booking flow (`/booking`, `components/BookingFlow.js`) mirrors checkout: guest-or-
  member aware, `member_account_id` derived server-side from the session cookie in
  `app/booking/actions.js` (never trusted from client input, same reasoning as orders).
  Confirmed bookings land on `/booking-confirmation/[bookingNumber]`; a signed-in member's
  history is at `/member/bookings`.
- Admin manages bookings at `/admin/bookings` — list, detail view, status
  (Pending/Confirmed/Completed/Cancelled), delete. Cancelled bookings don't block their slot.

**Date handling gotcha already hit once**: always compute "today" from local date parts
(`getFullYear()`/`getMonth()`/`getDate()`), never `new Date().toISOString().slice(0, 10)` —
`toISOString()` converts to UTC first, which reads as *yesterday* for any user west of UTC
during evening hours (e.g. a UK user at 00:30 BST). Both `lib/bookings.js` and
`components/BookingFlow.js` had this bug and were fixed the same way.

## AI content assistant

"Write with AI" (`components/AIAssistantButton.js`) appears on long-text fields across the
admin panel (Products, Portfolio, Blog, News & Events, About, Booking services) — every one of
those pages passes `aiEnabled={await isAIAssistantEnabled()}` down to its form, so the button's
visibility always reflects both the tier gate and the admin's own on/off toggle (see "AI
Assistant settings" below) consistently, not just the tier. Calls `lib/ai.js`'s
`generateContent()`, a raw `fetch()` to the Anthropic Messages API (no SDK dependency) — a
missing/invalid key or the feature being toggled off both fail with a clear inline error rather
than crashing.

**Never nest a `<form>`.** `AIAssistantButton` is always rendered inside another form (e.g. the
Products form). The first version used `useActionState` + a real `<form>`, and HTML silently
reparents a nested submit button to the *outer* form — clicking "Generate" submitted the whole
surrounding form instead. Fix: call the server action directly as an async function with a
manually-built `FormData`, no `<form>` element in the component at all. If you add another
widget that's meant to be embedded inside other forms, follow this pattern, not `useActionState`.

## Discount / promo codes

Premium only (`isModuleEnabled("cart")`), managed at `/admin/discount-codes`
(`lib/discountCodes.js`) — percentage or fixed-amount, optional expiry date and usage limit.

- The discount amount is **always recomputed server-side** in `lib/orders.js`'s
  `createOrder()` at the moment an order is placed — the checkout form only submits the code
  string, never an amount. Same "derive from trusted server state, not client input" principle
  used throughout (member IDs, booking slots).
- `orders.discount_code` / `orders.discount_amount` are snapshot columns, same reasoning as
  `customer_name`/`customer_email` — a code's definition can change or be deleted later without
  altering what a past order actually paid.
- `times_used` increments inside the same DB transaction as the order insert, so a failed order
  never consumes a usage slot.

## Customer-submitted reviews

Public "leave us a review" form at `/leave-a-review` (`lib/testimonials.js`), gated Plus+
(`isModuleEnabled("reviews")`) — the same tier that already has the third-party rating
platforms. **Deliberately a separate table from `reviews`**, not merged into it: `reviews` rows
model platform aggregates (Trustpilot's overall rating, a link, a logo), while a testimonial is
an individual written submission (author, star rating, body text) — different enough shapes
that merging them would mean a lot of nullable columns that only apply to one or the other.

- Every submission lands as `Pending`; only `Approved` ones ever appear on the home page
  (`getApprovedTestimonials()` never returns `author_email`, which is admin-only, kept solely
  in case they want to follow up).
- Moderation at `/admin/testimonials` — approve/reject inline from the list, or open a
  testimonial's detail page to also set its `display_order`. No edit-the-text option
  deliberately — approving is meant to publish the customer's actual words, not a
  admin-rewritten version of them.

## GDPR account closure

Premium only (member self-service, same tier as the member portal itself). A **request-then-
review** flow, not a one-click self-delete — the member asks from `/member/account`, an admin
reviews the request at `/admin/account-closures` (can contact the member directly outside the
system first), then either dismisses it or closes the account.

- **Closing anonymizes, it doesn't delete the row.** `closeMemberAccount()` in `lib/members.js`
  wipes name/email/phone/address/additional-details and revokes login (clears
  `password_hash`), but keeps the row and its `id` — `orders.member_account_id` and
  `bookings.member_account_id` stay valid FKs, so historical orders/bookings still resolve
  correctly. Those records' *own* `customer_name`/`customer_email` snapshot columns are
  untouched (business/financial records, commonly retained under a legal-obligation exception
  to erasure requests) — it's specifically the *account/profile* that's anonymized, not the
  business's transaction history.
- `membership_status` gets a fourth value, `'Closed'` (`members_membership_status_check_v2`
  constraint — see the constraint-naming gotcha below). A closed member can never be found via
  `verifyMembership()` again (it matches on postcode, which is wiped), and the member-portal
  layout checks live `membership_status` on every request (not just at login) so an
  already-issued session cookie stops working immediately once closed — see the Server
  Component gotcha below.
- **Server Components can't modify cookies.** The layout's closed-account check originally
  called `clearMemberSession()` (which calls `cookies().delete()`) directly from
  `app/member/(protected)/layout.js` — a Server Component — and Next.js throws `"Cookies can
  only be modified in a Server Action or Route Handler"`. Fix: just `redirect()`, don't clear
  the cookie. The stale cookie is harmless — the same live-status check blocks it again on
  every subsequent request, so it just silently expires unused.
- **Altering a CHECK constraint safely under concurrent requests.** `ensureTable()` runs on
  *every* request, so an unconditional `DROP CONSTRAINT` + `ADD CONSTRAINT` pair race under
  concurrent traffic — two requests can each pass the drop, then collide adding the same-named
  constraint back (`"constraint ... already exists"`, hit and fixed live during this build).
  Fix: drop the old constraint only if it exists, then add a **distinctly-named** replacement
  only if that name doesn't exist yet (`members_membership_status_check_v2`) — same
  `IF (NOT) EXISTS` pattern already used for the orders→members FK repoint, now the template for
  any future CHECK constraint change.

## Booking waitlist

Plus+ (same gate as booking itself). When `/booking` has no open slots for the chosen
service+date, `components/BookingFlow.js` swaps its submit form for a waitlist form
(`lib/bookingWaitlist.js`, `/admin/booking-waitlist`) instead of leaving the customer stuck.

- **Deliberately not automated.** No slot-matching, no auto-notify — an admin reviews the list
  and follows up manually (call/email/WhatsApp) if a slot on that date frees up, same
  "surface it, don't automate it" pattern as member password resets. Keeps the feature small;
  real matching (and notification delivery) is real complexity for later if it's ever needed.
- **Two sibling forms, never nested.** `BookingFlow` needed a second `<form>` (waitlist) that
  shares the service/date selection with the booking form but posts to a different action. Two
  forms can't nest, so the service/date pickers were pulled *out* of any `<form>` entirely
  (plain controlled elements, values passed into whichever form is showing via hidden inputs) —
  the two forms render as siblings, swapped by whether slots exist, never both mounted at once.

## AI Assistant settings (self-serve key + on/off toggle)

`ANTHROPIC_API_KEY` no longer has to be an env var — `/admin/ai-settings` (under Settings)
lets an admin paste their own key and flip the whole feature on/off, without an env var change
or redeploy. `lib/aiSettings.js` is a singleton table (`ai_settings`, same pattern as
`contact_info`/`about_info`) holding `enabled` (default `true`) and `api_key` (nullable).

- `lib/ai.js`'s `generateContent()` reads the DB row first; `api_key` there takes priority over
  `process.env.ANTHROPIC_API_KEY`, which is now purely a fallback for a deployment that hasn't
  configured one via the admin UI yet. If `enabled` is false, generation is refused before ever
  reaching the network, regardless of whether a key is configured.
- `isAIAssistantEnabled()` (also in `lib/ai.js`) is the single source of truth for whether the
  "Write with AI" button should render anywhere — it checks *both* the deployment's pricing
  tier (`isModuleEnabled("ai")`, fixed per client via `PLAN`) and the admin's own toggle
  (self-serve, meant for turning off API spend without losing the saved key). Every page that
  passes `aiEnabled` to a form calls this instead of `isModuleEnabled("ai")` directly now.
- The key is stored in plain Postgres, same trust boundary as everything else in this
  admin-only table — there's no at-rest encryption layer. Acceptable for this app's scale, but
  worth knowing if a client asks.

## Stale member sessions after GDPR closure

`getMemberSession()` only reads the signed cookie — its name/email are frozen at login and
don't reflect a later account closure. This was a real gap found live: a closed member's still-
valid cookie kept showing their old identity on `/checkout`, `/booking`, and `/leave-a-review`,
and could still attach new orders/bookings/reviews to the closed account, quietly defeating the
point of closing it.

Fix: `lib/memberSession.js` now also exports `getActiveMemberSession()` — same cookie check,
plus one live `membership_status` lookup, returning `null` for a closed (or deleted) account.
Every public flow that trusts a session to prefill identity or link a new record uses this
instead of the raw `getMemberSession()`: `app/checkout/*`, `app/booking/*`,
`app/leave-a-review/*`. Anything under `app/member/(protected)/` doesn't need it — the
protected layout already does the equivalent live check itself, paired with a redirect, before
any of those pages render. **If you add a new public flow that reads a member session to link a
new record, use `getActiveMemberSession()`, not `getMemberSession()`.**

## Settings / Subscription

Admin nav has a "Settings" group (`Account`, `Subscription`) — neither is module-gated, same as
`/admin/contact` and the rest of the always-on core. `/admin/subscription` shows the current
`PLAN` as a badge (read-only — changing tiers is a `PLAN` env var change + redeploy, not
self-serve), the business name from `config/site.js` (read-only), the signed-in admin's email
(read-only, comes from the `admins` row itself), and a mobile number field the admin can edit
(`lib/admins.js` — `mobile_no` column, same self-migrating `ALTER TABLE ADD COLUMN IF NOT
EXISTS` pattern as everywhere else, added lazily rather than in `db/schema.sql`/`scripts/
seed.js`, matching how every other incrementally-added column in this codebase works).

## Two separate auth systems

Admins and members are deliberately fully separate — different tables, different session
mechanisms, different cookie names, different secrets:

| | Admin | Member |
|---|---|---|
| Table | `admins` | `members` (yes — member *login* lives on the same row as the membership record; see `lib/members.js`) |
| Session | NextAuth JWT, `next-auth.session-token` cookie | Custom HMAC-signed cookie, `member_session` |
| Secret | `NEXTAUTH_SECRET` | `MEMBER_AUTH_SECRET` (falls back to `NEXTAUTH_SECRET` if unset) |
| Password reset | N/A (single seeded admin, self-service change at `/admin/account`) | Token-based, but no email provider configured — pending requests surface at `/admin/member-resets` for an admin to copy/send manually |
| Protection | `proxy.js` allowlist + `getToken()` | `proxy.js` lets `/member/*` through, then `app/member/(protected)/layout.js` does its own `getMemberSession()` redirect |

A signup with an email matching an existing admin-created `members` row (no password yet)
**claims** that row (keeps its Member ID/status, just activates login) instead of creating a
duplicate — see `signUpOrClaimMember` in `lib/members.js`.

## Deploying a new client site — checklist

1. Create a new Vercel project from this repo (or a client-specific fork/branch).
2. Provision Neon Postgres, connect it, `DATABASE_URL` auto-populates.
3. Provision a Vercel Blob store, connect it, `BLOB_READ_WRITE_TOKEN` auto-populates.
4. Set `NEXTAUTH_SECRET` and `MEMBER_AUTH_SECRET` — distinct generated values, not shared
   across clients.
5. Set `NEXTAUTH_URL` to the client's real domain once known.
6. Set `PLAN` to whichever tier they bought.
7. Run `npm run seed` (pointed at the client's `DATABASE_URL`) to create their first admin
   login.
8. Edit `config/site.js` for their business name, hero copy, nav, and which optional sections
   are enabled (`null` to remove a section entirely).
9. Seed initial content through the admin panel (products, about text, etc.) — or hand them
   `docs/project-profile-intake-form.docx` to fill in first.
10. Run `npm run smoke-test` against the deployed URL before handing over:
    ```bash
    BASE_URL=https://client-domain.com TEST_PLAN=basic npm run smoke-test
    ```
    (match `TEST_PLAN` to whatever you set `PLAN` to in step 6 — the script checks that every
    gated route returns exactly the right status for that tier, not just that the site is up.)

## Smoke testing

`scripts/smoke-test.js` — fast, no-auth route-health and plan-gating check. Doesn't exercise
CRUD, cart/checkout, or login flows (those need a real session; drive those by hand or with a
browser-automation tool for now). Run with `npm run smoke-test`; `BASE_URL` and `TEST_PLAN`
env vars point it at a specific deployment and tier.

## Where things live

Every content feature (Products, Blog, Gallery, News & Events, Reviews, Partners, Team, Team
Members, Certifications, Portfolio, Stats, How It Works, Orders) follows the same shape:

- `lib/<feature>.js` — schema (self-migrating via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`,
  no separate migrations directory), CRUD functions, seed-if-empty placeholder content.
- `app/admin/(protected)/<feature>/` — `page.js` (list), `new/page.js` (create),
  `[id]/page.js` (read-only detail view), `[id]/edit/page.js`, `actions.js` (server actions).
- `components/<Feature>Form.js` — the shared create/edit form, using `ImageFileInput` +
  `lib/blob.js` for any image fields.
- Public-facing rendering lives in `app/page.js` (home page sections) and, for features with
  their own pages, `app/<feature>/`.
