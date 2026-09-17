# Work Log

Reconstructed from the full commit history (`git log`, 88 commits, 2026-08-11 to present) —
**not a real timer**. Methodology: commits on the same date within 60 minutes of each other are
grouped into one working session; each session gets a 20-minute buffer before its first commit
and 10 minutes after its last (time spent before the first save and wrapping up after the last);
a lone commit gets a 30-minute floor. Gaps over 60 minutes start a new session.

**This systematically undercounts any session that produced one large commit** — a squashed
scaffold, a big feature landed in a single commit, or heavy in-editor work between saves leaves
no timestamp trail for the clustering to see. Days flagged ⚠️ below contain at least one commit
that almost certainly represents more real work than its cluster's estimate shows. Treat every
number here as a floor, not a precise record — useful for a rough sense of where the time went,
not for billing to the hour.

## 2026-09-17 (~38m) ⚠️

- **08:30 – 09:08** (~38m) — Fixed a real bug in `lib/products.js`: `updateProduct()` always
  wrote `image` even though its only caller (the basic-info save form) never supplied one,
  silently nulling a product's cover photo on every unrelated name/price/category save; added a
  real regression test to `scripts/smoke-test.js` (via a small module-alias loader) that
  exercises the actual product code directly instead of duplicating its logic. Compared
  `docs/site-content-sections-extended.md` against the live codebase and corrected two
  inaccuracies found in it. Read `docs/team-people-internals.md` and built the People/Teams/Team
  Members split for real: a standalone people directory, a `PersonSelect` type-to-search
  combobox, a duplicate-active-membership guard, independent team-level/member-level "former"
  flags with a current/former switcher on the public `/team` page, a URL-persisted team filter on
  the admin list, and a shared `MemberCard` — backfilling every existing `team_members` row into
  its own `people` row idempotently, verified against both local and live production data. Read
  `docs/whatsapp-cta-internals.md` and added a WhatsApp group-invite-link override across all
  three "Chat on WhatsApp" call sites, fixing a latent broken-link edge case in the footer CTA
  along the way. **Two commits 8 minutes apart badly understate this session** — it covered two
  full feature builds (a real relational schema split with a live data migration, plus a separate
  settings feature), each independently built, local-tested (build/lint/smoke-test/live browser),
  and verified on production before moving to the next.

## 2026-09-15 (~30m) ⚠️

- **~08:17** — Compared `docs/hero-partners-about-gallery-internals.md` against the live codebase
  and closed every gap found, in 5 separately-approved steps: client-side image compression
  before crop (fixing a pre-existing object-URL bug along the way); Partners gained
  `display_order` and a clickable-card link field; Gallery's crop pipeline was restricted to
  9:16/16:9 with a new `aspect_ratio` column, tag usage counts, debounced search, and a wider
  infinite-scroll margin; Gallery's home preview was rebuilt as a doubled-track marquee
  (replacing the old fade carousel) and its lightbox rewritten with scroll-zoom,
  double-click-to-2.2×, drag-to-pan, pinch, and a real focus trap, backed by a new
  `/api/gallery-photos` route; About/Vision & Mission/History gained three content-shape parsers
  that upgrade plain admin-typed text into card/timeline/icon-list layouts when it matches that
  shape, retiring History's manual milestones CRUD in favor of detecting dated paragraphs
  directly in the body. Single commit floored at 30 minutes — this was a full day's work across
  five independently built-and-verified sub-projects, each tested live in a real browser session
  and cleaned up before the next began; the real time here is easily several times what the
  single commit implies.

## 2026-09-11 (~30m) ⚠️

- **~16:04** — Overhauled SEO metadata site-wide: every public route now goes through one shared
  `buildPageMetadata()` builder instead of each hand-rolling its own subset, adding canonical URLs
  and Open Graph/Twitter images to most of the site for the first time. Replaced a static OG
  placeholder image that had literally been shipping "YOUR_BUSINESS_NAME" to anyone who shared a
  link with a real dynamic PNG route rendering the actual business name/tagline. Added Article and
  Product JSON-LD structured data. Caught and fixed two real bugs during the work: the sitemap
  listed the Premium-only Membership page unconditionally, pointing crawlers at a page that 401s
  on lower tiers; and the new OG-image route itself 401'd because its extensionless URL fell
  through `proxy.js`'s static-asset matcher. Single commit floored at 30 minutes — likely
  understates the real time given the number of routes touched and the two bugs chased down.

## 2026-09-08 (~30m) ⚠️

- **~00:44** — Rebuilt the Gallery feature: tags and an optional taken date, automatic upload
  compression, a Pinterest-style masonry public page with infinite scroll/filter chips/search and
  a zoomable lightbox, and an auto-advancing home page preview carousel. How It Works steps
  gained a curated icon picker; Partners' "Trusted By" strip became bordered cards with a hover
  effect; History gained a real vertical timeline once milestones are added, falling back to the
  plain block otherwise. Separately, made the Home Page Layout "Fill browser width" setting apply
  to Gallery/Blog/Team/News & Events (previously home-page-only), and added a global
  horizontal-scroll safeguard that immediately caught and fixed a real mobile nav overflow on all
  four pages. Two commits 28 seconds apart, floored as one 30-minute session — the commit's own
  description of everything verified live through the real admin UI makes clear this was a much
  longer session than that.

## 2026-09-04 (~2h 48m) ⚠️

- **11:40 – 13:27** (~1h 47m) — Built the Home Page Layout system (Default/Custom/Sidebar
  presets, drag-and-drop section reorder, a Fill-browser-width toggle shared across all three
  layouts); added the Sidebar Layout preset with an adjustable aside position and multi-select
  aside content (News & Events/Blog/Reviews); grouped Home Page Layout, Section Text, and Site
  Navigation under one "Layout" admin menu; made "Products" the generic label everywhere
  (Feature Config, Home Page Layout, Section Text) instead of the old "(Add-ons)" wording;
  overhauled Site Navigation with drag-and-drop reorder, a typo-proof destination picker, and
  live "switched off" status flags on nav items.
- **17:20 – 18:21** (~1h 01m) — Replaced the single hero with a full multi-slide carousel
  (`hero_slides` table; admin list/reorder/new/edit; autoplay, swipe, keyboard nav, Ken Burns
  pan, a segmented progress bar) with optional per-slide background video; caught and fixed two
  real bugs during end-to-end testing (a shared reorder component silently breaking its own
  aria-labels for a different data shape; a migration that could poison its own transaction on a
  brand-new deployment); moved local Postgres to port 5436 to resolve a clash with another
  project's container; pushed 11 commits and deployed to Vercel production for the first time
  this session; added two more production hero slides (a generated News & Events image, a
  generated Blog video) directly against the live database, since Vercel's Secret-type env vars
  aren't retrievable via the CLI; mirrored production's full database down to local for parity,
  which surfaced a Postgres 16 vs. 17 version mismatch; built `npm run db:pull-prod` to make that
  repeatable on demand; fixed a `.gitignore` bug that had silently excluded
  `.env.example`/`.env.local.example` from version control since the project began. **This
  session's commit count badly understates the real time** — most of the second block was
  interactive production verification (deploys, smoke tests, live browser testing, a manual
  database dump/restore) that leaves no commit trail at all, on top of the usual squashed-commit
  undercount.

## 2026-09-03 (~3h 49m)

- **07:07 – 09:14** (~2h 10m) — Hero section mobile fixes (image/heading collision, optional
  mobile-specific hero image, iterated on in-flow vs. behind-text placement); shipped Vision &
  Mission and History as new optional home page modules; added image upload (left/right/behind
  text) to About Us; extracted the shared `ImageTextSection`/`ImageTextSectionForm` components;
  documented the pattern in `developer-notes.md`.
- **16:30 – 17:12** (~1h 12m) — Added the business name to the admin login page; created this
  work log.

## 2026-09-02 (~2h 14m) ⚠️

- **~11:59** — Added multi-photo product galleries (up to 8 photos/product) with crop, rotate,
  and aspect-ratio cropping; direct-to-Blob upload; admin photo manager; public lightbox. Single
  commit, floored at 30 min — the largest single feature in the whole log, real time here is
  very likely several times that.
- **21:04 – 22:19** (~1h 44m) — Rolled the crop/rotate/straighten tool out to all 12 admin image
  forms (previously Products-only); fixed a real production race in product cover-photo
  selection; fixed the product photo lightbox close button; validated crop output against a
  silent-broken-upload edge case; documented the day's work.

## 2026-08-20 (~1h 22m)

- **00:31 – 00:35** — Made the site fully admin-editable: hero, logo, legal pages, social links,
  nav, admin panel text; fixed a table-creation race that had broken the prod build.
- **17:39 – 17:57** — Changed the pricing CTA copy to "Get my free quote"; added the launch
  to-do list and drafted two booking-service icons.

## 2026-08-19 (~30 min)

- **~20:05** — Added self-serve Feature Config, redesigned compare-plans, updated pricing.

## 2026-08-17 (~1h 34m)

- **02:00 – 02:04** — Added the AI content assistant, booking system, and Premium
  commerce/trust features; fixed a production build failure (DB `search_path`).
- **~19:01** — Added self-serve AI Assistant settings (API key + on/off toggle).
- **~21:46** — Rebranded as the Falcon Web Suite demo site, with Plans, pricing, and hero
  visuals.

## 2026-08-16 (~31 min)

- **21:29 – 21:30** — Updated the project intake form and added the Falcon Web features
  profile; added Vercel Blob image uploads across every admin CRUD feature; fixed home page nav
  anchors landing under the sticky header.

## 2026-08-15 (~2h 39m) ⚠️

- **08:45 – 10:54** — Added Team/Team Members (public "Meet our team" section), Membership
  (admin CRUD + status verification), Partners (CRUD + "Trusted By" strip), News & Events
  (CRUD + public pages); made the admin nav bar responsive and grouped into dropdowns; migrated
  Stats and How It Works off static config to CRUD; added a back-to-top button, the Gallery
  feature, the Team "show on home" toggle + full `/team` page, and a team demo seed script;
  fixed a real hydration error on `/admin/analytics`. 13 commits in ~2 hours — likely close to
  real time, but on the dense side.

## 2026-08-14 (~40 min)

- **19:13 – 19:23** — Closed 10 feature gaps found from a generalized-template comparison;
  added Burgundy and Onyx Gold as the 7th/8th color themes.

## 2026-08-12 (~3h 00m)

- **17:35 – 17:48** — Removed the stale default Next.js favicon and scaffold icons; added
  developer/author credit.
- **18:53 – 20:40** — Added the enquiry submissions inbox + admin dashboard stats, site
  analytics (visit tracking, world map, country filter), the blog section + CRUD, products CRUD,
  cookie consent + SEO basics + a branded error page, the Contact Us info section, 6 selectable
  color themes; fixed header nav (scroll-to-top, spacing, mobile overflow); renamed the project
  from falcon-app to falcon-web (app + local Docker DB); updated the tutorial doc.

## 2026-08-11 (~2h 34m) ⚠️

- **~10:52** — Added `CLAUDE.md` with the initial falcon-app project brief.
- **13:02 – 14:06** — **Full initial Next.js scaffold: auth, admin panel, home page** (single
  commit — this is the single most understated entry in the whole log, a scaffold like this
  realistically took hours, not the ~1h34m this cluster shows); master color theme system;
  client project profile intake form; developer tutorial + C4 Level 3 diagram; real
  product/portfolio photos and Trustpilot/Google review badges.
- **~17:03** — Added `.vercel` to `.gitignore`.

---

## Cumulative

| Date | Estimated | Cumulative |
|---|---:|---:|
| 2026-08-11 | 2h 34m | 2h 34m |
| 2026-08-12 | 3h 00m | 5h 34m |
| 2026-08-14 | 0h 40m | 6h 14m |
| 2026-08-15 | 2h 39m | 8h 53m |
| 2026-08-16 | 0h 31m | 9h 24m |
| 2026-08-17 | 1h 34m | 10h 58m |
| 2026-08-19 | 0h 30m | 11h 28m |
| 2026-08-20 | 1h 22m | 12h 50m |
| 2026-09-02 | 2h 14m | 15h 04m |
| 2026-09-03 | 3h 49m | 18h 53m |
| 2026-09-04 | 2h 48m | 21h 41m |
| 2026-09-08 | 0h 30m | 22h 11m |
| 2026-09-11 | 0h 30m | 22h 41m |
| 2026-09-15 | 0h 30m | 23h 11m |
| 2026-09-17 | 0h 38m | **23h 49m** |

**Running total: ~23h 49m** across 15 working days (2026-08-11 → 2026-09-17) — a floor, not a
ceiling, per the caveats above. Add a new dated entry per work session going forward; keep the
newest at the top.
