# Falcon Web — Modules & Features Blueprint

Full inventory of every module built into this codebase, with sub-features and field-level
detail. This is the "what exists and what it does" reference — for pricing/packaging see
`docs/package-plans.md`, for env vars/deployment/architecture see `docs/developer-notes.md`.

Every content module below follows the same underlying pattern unless noted: a Postgres table
that self-migrates (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, no separate migrations
directory), full admin CRUD (List → Create → **Detail View** → Edit → Delete), and — where the
module has an image field — upload via Vercel Blob with client-side size/type validation.

---

## 1. Public site core

### 1.1 Home page
Single-page layout assembling every optional section below, in order. Each optional section
renders behind a `{section && ...}` check driven by `config/site.js` — set a key to `null` to
remove it from the page entirely (and, combined with the plan system, that removal can be
enforced automatically per pricing tier).

- Hero: heading, subheading, primary/secondary CTA buttons (configurable label + link)
- Stats strip: up to N value/label pairs, admin-managed, display-ordered
- "How it works": numbered step list, title + description, display-ordered
- Trusted-by / Partners strip: active partners' logos
- Certifications badge strip: badge image or fallback placeholder circle
- Map / location: live Google Maps embed using the business address
- Contact info block: address/phone/email with icons, independent enable toggle
- Enquiry form section
- Footer CTA band: heading/subheading + WhatsApp button (own message, distinct from the
  floating button's message) + social links

### 1.2 SEO & structured data
- Open Graph + Twitter Card meta tags per page
- `LocalBusiness` JSON-LD structured data (`lib/structuredData.js`)
- `robots.txt`, `sitemap.xml`

### 1.3 Theme system
- 8 built-in color themes (Ocean Blue, Forest Green, Desert Orange, Royal Purple, Ferrari Red,
  Golden, Burgundy, Onyx Gold) — 6 with independent light/dark variants, 2 dark-only by design
- Light/dark mode toggle, persisted client-side
- Theme switcher gated by plan tier (Basic = one fixed theme, no switcher shown)
- Custom-palette support via `docs/theme-prompt-template.md` for a fully bespoke look

### 1.4 Cookie consent
Accept/decline banner; declines suppress analytics tracking.

### 1.5 Analytics
- Per-visit tracking (`site_visits` table), day-bucketed
- Admin dashboard: visits-this-month count, bar chart by day (`/admin/analytics`)

### 1.6 WhatsApp integration
- Floating WhatsApp button, sitewide, own pre-filled message
- Footer CTA WhatsApp button, separate pre-filled message
- Both numbers/messages configured in `config/site.js`

### 1.7 Social links
Row of platform icon links (X, Facebook, Instagram, TikTok, etc.), each optional.

### 1.8 Enquiry form
- Public form (name, phone, email, message) → `/api/enquiries` → `enquiries` table
- Admin inbox at `/admin/enquiries`, full message shown inline (no separate detail view needed
  at this volume)
- Dashboard shows unread/recent count

### 1.9 "Site Unavailable" (401) handling
Any route not on the explicit public/protected allowlist in `proxy.js` — or that belongs to a
module outside the current plan tier — renders this page with a real 401 status, not a
default Next.js 404.

---

## 2. Content modules (each: full CRUD + Detail View)

| Module | Key fields | Public surface |
|---|---|---|
| **Products** | name, description, price label (free text), cart price (numeric, optional), image, category, display order | Home grid (with category filter) + `/products/[id]` detail page |
| **Portfolio** | name, description, image, display order | Home "Our Work" grid with captions |
| **Gallery** | image (required), caption (optional) | Home teaser (3 most recent) + full `/gallery` page |
| **Blog** | title, slug (auto-generated + uniqueness-checked), excerpt, body, cover image, published date | Home teaser (3 most recent) + `/blog` list + `/blog/[slug]` detail |
| **News & Events** | type (News/Event discriminator), title, slug, summary, description, image, published date, event date, event location (event-only) | Home teaser + `/news-events` list + `/news-events/[slug]` detail |
| **Reviews** (platform) | platform name, rating, review count, profile URL, logo, display order | Home ratings strip |
| **Partners** | name, description, status (Active/Inactive), partnership start/end dates, logo | Home "Trusted by" strip (active only) |
| **Certifications** | name, badge image, display order | Home badge strip |
| **Stats** | value, label, display order | Home stats strip |
| **How It Works** | title, description, display order | Home numbered steps |

### 2.1 Team & Team Members
Two related tables, not one:

- **Teams**: name, description, display order, "show on home" toggle
- **Team Members**: ID No, name, title, contact number, email, service join/end dates, team
  assignment, active flag, "show on home" toggle, photo
- Two-level visibility: a member only appears on the home page if *both* they and their
  parent team have "show on home" enabled *and* they're active; everyone active appears on the
  full `/team` page regardless
- Team's Detail View lists its members inline, each linking through to that member's own
  Detail View

### 2.2 About Us
Singleton (not a list) — heading + body text, edited directly, no separate create/delete.

### 2.3 Contact Info block
Singleton with an independent enable/disable toggle — heading, subheading, address, phone,
email. Distinct from the Map section (which reuses the business address) and from the footer
WhatsApp CTA.

### 2.4 Customer-submitted reviews
Public "leave us a review" form (`/leave-a-review`), same Plus+ gate as platform Reviews — a
deliberately separate table from it (an individual written testimonial has a different shape
than a platform-aggregate rating row).

- Public form: star rating (1–5), author name, review body, optional email (private — for
  admin follow-up only, never shown on the site)
- Every submission starts `Pending`; only `Approved` ones appear on the home page
- `/admin/testimonials`: moderation queue (approve/reject inline), detail page also sets
  display order — no edit-the-text option, so an approved review is always the customer's own
  words
- Guest or member aware, same session-derived-not-trusted pattern as orders/bookings
- Home page also shows a computed average (e.g. "4.9 / 5 average from 23 customer reviews")
  above the testimonials grid, from Approved reviews only

---

## 3. Membership & accounts

### 3.1 Membership records
- Admin-managed table: Member ID (unique code), first/last name, mobile, email, status
  (Active/Expired/Suspended), full address fields, postcode, additional notes
- Public self-verification at `/membership` — last name + postcode lookup, returns only
  identity + status (never address/email/mobile, even to a matching requester)

### 3.2 Member login portal
- **Same table as membership records** — a member's login credentials live on their existing
  membership row, not a separate account system. Login fields: password hash, reset token,
  reset token expiry (all nullable — an admin-created record has no login until claimed)
- **Signup**: if the submitted email matches an existing admin-created membership record with
  no password yet, signup *claims* that record (keeps its Member ID/status/history) instead of
  creating a duplicate. A genuinely new email creates a fresh record.
- **Login / logout**: custom HMAC-signed session cookie, fully independent of admin sessions
  (separate cookie name, separate signing secret)
- **Forgot password**: generates a single-use, 1-hour-expiry token. No email provider
  configured — the request surfaces at `/admin/member-resets` for an admin to copy the reset
  link and send it manually (WhatsApp, email, however they'd normally reach the member)
- **Change password**: self-service on the member's account page, current password verified
  first
- **Account page**: shows name/email, Member ID, membership status, "My orders" link
- **Order history**: `/member/orders` — every order placed while logged in, with status

### 3.3 Admin member management
- `/admin/members`: list with Membership status badge *and* "Login active" badge (has a
  password set or not)
- Detail View shows both statuses together
- Edit page includes a **direct password reset** action — admin types or generates a new
  password and sets it immediately, no token/link round-trip required
- `/admin/member-resets`: queue of member-initiated forgot-password requests awaiting manual
  follow-up

### 3.4 GDPR account closure
Request-then-review flow, not a one-click self-delete: a member requests closure from
`/member/account`, an admin reviews it at `/admin/account-closures` (can contact the member
directly outside the system first), then dismisses the request or closes the account.

- Closing **anonymizes**, it doesn't delete the row — name/email/phone/address wiped, login
  revoked, but the row (and its id) stays so `orders.member_account_id` /
  `bookings.member_account_id` keep resolving. Those records' own snapshotted customer details
  are untouched — it's the account/profile that's anonymized, not the business's transaction
  history.
- `membership_status` gains a fourth value, `Closed` — an already-open member session is
  revoked on its very next request (the member layout checks live status, not just the login
  token), and a closed member can never be found again via the public `/membership` lookup
  (postcode, part of the lookup key, is wiped).

---

## 4. Commerce

### 4.1 Shopping cart
- Client-side, `localStorage`-backed (`falcon_cart` key) — guest-usable, no login required
- Add/remove/update-quantity from any product with a cart price set
- Cart icon in the header with live item-count badge
- `/cart` page: line items, quantity edit, subtotal, proceed to checkout

### 4.2 Checkout
- `/checkout`: customer details (name, email, phone, address, notes) + order summary
- **Guest or member**: if a member is logged in, fields pre-fill from their account and the
  order is linked to it (`orders.member_account_id`) — derived server-side from the session,
  never trusted from client input, so a guest can't spoof attaching an order to someone else's
  account
- Guests see a "Log in to save this order to your account" prompt with a working
  post-login redirect back to checkout
- **Pay-offline model**: no payment gateway integrated. Placing an order creates a `Pending`
  request; the business follows up to arrange actual payment.

### 4.3 Order management
- Auto-generated order number (`ORD-000042`, derived from the row ID)
- Each order snapshots product name/price at time of purchase (later price/name changes don't
  retroactively alter past orders)
- Admin list + Detail View: customer info, delivery address, notes, itemized products,
  subtotal, discount applied (if any), total, "Member account" badge when applicable
- Status workflow: Pending → Confirmed → Fulfilled / Cancelled, changeable from the Detail View
- Order confirmation page shown to the customer immediately after placing an order

### 4.4 Discount / promo codes
Admin-managed at `/admin/discount-codes` — percentage or fixed-amount off, optional expiry
date, optional usage limit.

- Applied at checkout via a code field; the discount amount is always recomputed server-side
  when the order is actually placed, never trusted from the checkout form
- Usage count increments in the same DB transaction as the order, so a failed order never
  consumes a usage slot

---

## 5. Booking & scheduling

Real-time slot calendar, gated Plus/Premium (`isModuleEnabled("booking")`). One shared
calendar for the whole business — a booked slot blocks that time regardless of which service
it was for (no multi-staff/multi-resource support).

### 5.1 Booking services
- Admin CRUD + Detail View (`/admin/booking-services`): name, description (with "Write with
  AI" assist), duration in minutes, price label, image, active toggle, display order
- Duration drives the slot grid — a 45-min service offers a slot every 45 minutes within each
  open window

### 5.2 Availability
- Admin CRUD (`/admin/availability`): weekly recurring windows (day of week + start/end time),
  as many per day as needed
- No availability set = no bookable slots anywhere, by design (nothing to book into)

### 5.3 Public booking flow
- `/booking`: service picker → date picker → live slot picker (computed on request, not
  stored) → customer details form
- Guest-or-member aware, same pattern as checkout — a signed-in member's booking is linked via
  `member_account_id`, derived server-side from the session cookie, never trusted from the
  submitted form
- `/booking-confirmation/[bookingNumber]` shown immediately after booking
- `/member/bookings` — a signed-in member's booking history

### 5.4 Admin booking management
- `/admin/bookings`: list + Detail View, auto-generated booking number (`BKG-000001`)
- Status workflow: Pending → Confirmed → Completed / Cancelled — cancelling frees the slot

### 5.5 Waitlist
When a chosen date has no open slots, the public booking form swaps to a waitlist join form
instead of a dead end. `/admin/booking-waitlist` lists everyone waiting (name, contact, wanted
date, notes) with quick status actions (Notified / Fulfilled / Cancel). Deliberately manual —
no automatic slot-matching or notification; an admin follows up directly if something frees up.

---

## 6. AI content assistant

"Write with AI" (`components/AIAssistantButton.js`), gated Plus/Premium
(`isModuleEnabled("ai")`) — needs `ANTHROPIC_API_KEY` set, or the feature shows a clear inline
error instead of crashing.

- Appears next to long-text fields across the admin panel: Products, Portfolio, Blog, News &
  Events description, About Us body, Booking service description
- Free-text instruction ("write a friendly 2-sentence description") plus the field's existing
  text as context → generated preview → one click to insert into the field
- Calls the Anthropic Messages API directly via `fetch()` in `lib/ai.js` (no SDK dependency)
- Always called as a plain async function from inside its host form, never its own nested
  `<form>` — every usage site embeds it inside another form, and HTML doesn't allow nested forms

---

## 7. Image uploads

Shared across every module with an image field (Products, Gallery, Team, Partners, Reviews,
Blog, News & Events, Certifications, Portfolio):

- `components/ImageFileInput.js` — single reusable file input, used everywhere
- Client-side validation before upload: file type (image/* only) and size (4.5MB cap — Vercel's
  hard limit for Server Action request bodies), with an immediate inline error naming the file
  and its actual size if it fails either check
- Server-side upload via `lib/blob.js` → Vercel Blob, explicit token auth (bypasses a known
  OIDC auto-detection issue in local dev)
- Old blob is deleted automatically when an image is replaced or its record is deleted

---

## 8. Admin panel

### 8.1 Authentication
NextAuth (Auth.js), Credentials provider, JWT session strategy, `admins` table (bcrypt-hashed
passwords). Single seeded admin by default (`npm run seed`); self-service password change at
`/admin/account`.

### 8.2 Dashboard
`/admin` — signed-in-as summary, enquiry count, visits-this-month, database connection status.

**"Needs attention" widget**: one card aggregating every pending queue this admin panel has
grown (pending customer reviews, orders awaiting confirmation, booking waitlist, account
closure requests, password reset requests) into a single glance, each linking straight to its
own page. Only counts/shows queues belonging to a module actually in this deployment's plan —
computed fresh on every dashboard load (no caching, no stored "unread" flags), so it's always
accurate but does mean the dashboard fires one query per active module.

### 8.3 Navigation
- Grouped nav (Content / People / Insights) matching the module categories above
- **Plan-aware**: filters to only the modules included in the deployment's tier; a group with
  every child filtered out (e.g. "People" on Basic) disappears entirely rather than rendering
  empty
- Current plan tier shown as a colored badge next to "Admin" in the header (Basic = gray,
  Plus = blue, Premium = amber)

### 8.4 The CRUD pattern
Every content module above follows the identical admin structure:

- **List** (`/admin/<feature>`) — every record, key fields, status badges where relevant, links
  to View/Edit/Delete
- **Create** (`/admin/<feature>/new`)
- **Detail View** (`/admin/<feature>/[id]`) — read-only, every field, timestamps, "View on
  site →" link where a public page exists
- **Edit** (`/admin/<feature>/[id]/edit`) — same form component as Create, pre-filled
- **Delete** — confirmation-gated, cascades related Blob images

---

## 9. Platform / infrastructure

### 9.1 Route protection (`proxy.js`)
Central allowlist-based gate (this Next.js version's renamed `middleware.js`):
- Public routes/prefixes pass straight through
- Protected admin routes require a valid NextAuth token, else redirect to `/admin/login`
- Member-protected routes are self-protecting via their own layout's session check
- Anything unmatched, *or* matched but outside the deployment's plan tier, returns a real 401
  and renders "Site Unavailable"

### 9.2 Pricing tier gating (`lib/plan.js`)
See `docs/package-plans.md` for the client-facing tier breakdown and `docs/developer-notes.md`
for the full technical detail (env var, enforcement mechanism, known edge cases).

### 9.3 Database
Postgres — Docker locally, Neon in production. No separate migration tool; every `lib/*.js`
module's `ensureTable()` runs `CREATE TABLE IF NOT EXISTS` + any `ALTER TABLE ADD COLUMN IF
NOT EXISTS` needed, executed lazily on first use of that module. Seed-if-empty placeholder
content ships with most modules so a fresh install isn't blank.

### 9.4 Smoke testing
`scripts/smoke-test.js` (`npm run smoke-test`) — route-health and plan-gating checks against a
running deployment, no auth required. See `docs/developer-notes.md` for usage.

---

## Document map

| Doc | Purpose |
|---|---|
| `docs/modules-blueprint.md` (this file) | Full feature/sub-feature inventory |
| `docs/package-plans.md` | Client-facing pricing tiers |
| `docs/developer-notes.md` | Env vars, deployment steps, architecture detail |
| `docs/theme-prompt-template.md` | Prompt template for generating a custom color theme |
| `docs/project-profile-intake-form.docx` | Client content-intake form for onboarding |
| `docs/falcon-web-features-profile.html` | Marketing-styled features one-pager |
| `docs/future-work.md` | Deferred feature ideas — backlog, not a roadmap |

Keep this file in sync whenever a module is added, removed, or its fields change — it's the
source of truth other docs (package plans, dev notes) point back to.
