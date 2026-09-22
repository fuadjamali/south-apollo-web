# Falcon Web — Future Work

Feature ideas discussed and deliberately deferred, kept here so they aren't lost between
sessions. None of these are started — this is a backlog, not a roadmap with dates. When one
gets picked up, move its entry into `docs/modules-blueprint.md` (and `docs/package-plans.md` if
it affects a tier) and delete it from here.

## Bigger lift — worth scoping properly before starting

- **Real transactional email.** Right now every "notify someone" flow (order placed, booking
  confirmed, password reset, closure request) either shows an on-screen message or lands in an
  admin queue for manual follow-up (`/admin/member-resets`, `/admin/account-closures`, etc).
  Wiring in a real provider (Resend has a workable free tier) so customers get an actual
  confirmation email would be the single biggest professionalism upgrade left in the app. Needs
  a new env var (`RESEND_API_KEY` or similar) and a template per notification — bigger lift than
  anything else on this list, but it's the thing every one of these flows is quietly missing.

- **CSV export for Orders / Bookings / Members.** An "Export CSV" admin button on each list
  page — no new tables, just formatting existing query results. Low effort, but touches several
  admin list pages, so scope it as one sitting rather than squeezing it into something else.

- **Multi-staff / multi-resource booking calendars.** The booking system is deliberately one
  shared calendar for the whole business (see `docs/developer-notes.md` → "Booking &
  scheduling"). Supporting several independent staff calendars is a real architecture change
  (per-resource availability, per-resource conflict checks, choosing a staff member as part of
  the public flow) — don't attempt this as a quick add-on.

- **Multilingual (EN/BN) support.** Discussed but not started — see
  `docs/multilingual-i18n-plan.md` for the full write-up: URL routing strategy (path-prefix vs.
  cookie-based), a JSONB-overlay approach for translated content, a small hand-rolled dictionary
  for interface strings, and a phased rollout. Two architectural decisions are still open there.

## Small, contained — good next pick-ups

- **Add-to-calendar link on booking confirmation.** A "Add to Google/Apple Calendar" link
  (`.ics` file or a Google Calendar URL) on `/booking-confirmation/[bookingNumber]`. No new
  dependency, just a formatted link.

- **FAQ module.** Same CRUD shape as How It Works — question, answer, display order — rendered
  as an accordion on the home page. Common ask from small-business clients, cuts down on
  repetitive enquiry-form questions. Would sit in the Plus tier alongside the other content
  modules.

- **RSS feed for the blog.** `/blog/rss.xml`, generated from existing blog data. Minor SEO/
  syndication win if Blog is enabled, essentially free to build.

## Mentioned, lower priority

- **Newsletter / email capture.** Just capture emails somewhere (no sending) as a foundation
  for actual email marketing later — only worth it once real transactional email (above) exists
  as infrastructure, otherwise it's a list with nowhere to send to.
- **Loyalty / points program.** Would pair with orders/bookings for a Premium-tier
  differentiator, but no client demand identified yet — don't build speculatively.
- **Site-wide search** (blog/news/products). Moderate effort, moderate value for a brochure-
  sized site; revisit if content volume grows.
