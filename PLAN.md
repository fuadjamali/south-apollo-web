# falcon-web — Build Plan

## Pages

- `/` — Home, public. Real home page branded "Falcon App" (usable for marketing later, not just a static placeholder).
- `/admin/login` — public login form, calls `signIn("credentials", ...)`.
- `/admin` — protected, minimal dashboard. Shared admin layout adds a section-wise nav (Home, Trusted By, Products, Portfolio, Reviews, About, Certifications, Contact Us) mapping to `config/site.js` keys, plus sign-out. Nav links point to future per-section edit routes — groundwork for letting the admin edit site content instead of hardcoding it. **Products and Blog are now actually built** (see "Products CRUD" and "Blog CRUD" below; Blog's admin link lives outside this original nav array, in `admin.nav`); the rest (Trusted By, Portfolio, Reviews, About, Certifications, Contact Us) are still unbuilt placeholder links.
- Site Unavailable (401) — component/page rendered for unmatched routes. Mockup at `mockup/site-unavailable.html`.
- Home page additionally includes: a stats/counters strip, trusted-by/partners logo strip, a "How it works" 3-step section, review ratings (Trustpilot/Google/etc.), a certifications section, a map/location embed, and a social links row in the footer (X, Facebook, Instagram, TikTok, etc.) — all config-driven, static placeholders for now.
- Home page also has a mobile hamburger nav, a floating WhatsApp button, SEO meta tags (Open Graph/Twitter card), and a standard enquiry form (name, phone, email, message) placed above the contact footer — not yet wired to a backend, needs an API route or mailto handler when building the real app.

## Steps

1. ✅ **Scaffold Next.js**
   `create-next-app` with App Router, Tailwind, JS, no src dir.

2. ✅ **Install extra dependencies**
   `next-auth` (Auth.js), `pg` (Postgres client), `bcrypt` (password hashing), `@tabler/icons-react` (icon set).

3. ✅ **Docker Postgres for local dev**
   `docker-compose.yml` — Postgres mapped to host port `5433` (not `5432` — a native Postgres service was already bound to `5432` on the dev machine).

4. ✅ **Env files**
   `.env.example`, `.env.local.example`, and a real `.env.local` (gitignored) with `DATABASE_URL`, a generated `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.

5. ✅ **Database schema + seed script**
   `db/schema.sql` + `scripts/seed.js` (bcrypt-hashes a password, upserts one admin). `npm run seed` verified working end-to-end.

6. ✅ **Auth.js setup**
   `app/api/auth/[...nextauth]/route.js` — Credentials provider checking `admins` via bcrypt, JWT sessions. `lib/db.js` holds the shared `pg` pool. Verified: correct login issues a session, wrong password is rejected.

7. ✅ **Pages**
   All four pages built, config-driven via `config/site.js`. Admin nav/sign-out chrome scoped to `app/admin/(protected)/` via a route group so it doesn't leak onto `/admin/login`.

8. ✅ **Central access control**
   Implemented as `proxy.js` (Next.js 16 renamed `middleware.js` → `proxy.js`; same behavior). Also had to explicitly allow `/api/auth/*` through — it was initially being caught by the catch-all 401 branch, which broke the entire auth flow (CSRF, login) until fixed.
   - `/` and `/admin/login` always accessible.
   - `/admin/*` requires a valid session (via `next-auth/jwt` `getToken`) else redirects to `/admin/login`.
   - Anything else → 401 + rewrite to `/site-unavailable`.

9. ✅ **Styling**
   Tailwind v4 (CSS-first config, no `tailwind.config.js`). Dark mode wired via `@custom-variant dark` in `globals.css` + a `.dark` class toggle (matches the mockups' approach), with a `ThemeScript` in `app/layout.js` to avoid a flash of the wrong theme on load.

10. ✅ **README**
    Full setup steps (Docker, env, install, seed, dev), a note on the port 5432→5433 change, template customization guidance (`config/site.js`), and Vercel deploy steps.

11. **Sanity check** — in progress. Confirmed via `curl`: `/` → 200, `/admin/login` → 200, `/admin` unauthenticated → 307 redirect, `/admin` authenticated → 200 with session email, unknown route → 401 Site Unavailable, `npm run build` clean with no warnings. Not yet visually verified in an actual browser (browser pane wasn't available during this session) — worth a manual click-through before calling this fully done.

## Post-MVP polish

- ✅ Real favicon (`app/icon.svg`, matches the logo) — was still the default Next.js icon.
- ✅ `public/og-image.svg` placeholder (needs to become a real PNG/JPG before actual deployment — most social crawlers don't render SVG `og:image`).
- ✅ Fixed `proxy.js`: `/admin/*` paths without a real page previously fell through to Next's default 404 instead of the Site Unavailable page, because it prefix-matched `/admin` rather than checking against a real route list. `PROTECTED_ROUTES` is now an explicit allowlist — add new admin routes to it as they're actually built.
- Still open: no rate limiting/lockout on `/admin/login`, no password-reset flow (re-seed only).
- ✅ Enquiry form now has a real submit handler — see "Admin panel additions" below.

## Admin panel additions

- ✅ **Enquiry submissions inbox.** New `enquiries` table (`db/schema.sql`). The home page's enquiry
  form (`components/EnquiryForm.js`, extracted from `app/page.js` into its own client component)
  now actually submits via `POST /api/enquiries` (`app/api/enquiries/route.js` — public route,
  validates required fields, returns 400/201) instead of doing nothing. Submissions are viewable at
  `/admin/enquiries` (new protected page, added to `proxy.js`'s `PROTECTED_ROUTES` and to
  `config/site.js`'s admin nav).
- ✅ **Dashboard stats.** `/admin` now shows: enquiry count (links through to the inbox), a
  DB connection health indicator (`SELECT 1`, green/red dot), and "Signed in since" (a `loginAt`
  timestamp added to the JWT at sign-in via the `jwt`/`session` callbacks in the NextAuth route).
- **Real bug caught during this work**: both `/admin` and `/admin/enquiries` need to query the
  database live on every request, but Next.js only infers dynamic rendering automatically when a
  page calls a dynamic API (like `getServerSession`, which reads cookies) — `/admin/enquiries`
  doesn't call that, so it was silently getting prerendered as a **static** page at build time
  (confirmed via `npm run build` output: `○ Static` instead of `ƒ Dynamic`). That would have frozen
  the enquiry list at whatever it was during the last deploy. Fixed by adding
  `export const dynamic = "force-dynamic"` to both pages explicitly, rather than relying on an
  incidental side effect of an unrelated API call.
- Skipped on request at the time: real content-editing CRUD (nav links pointed nowhere), and the
  security items (rate limiting, password reset) — the CRUD gap was later closed for Products, see
  below. Rate limiting/password reset remain deliberately out of scope.

## Products CRUD (admin panel)

- ✅ **Moved products from static `config/site.js` to a real `products` table.** This is the first
  section actually migrated off the static-config pattern to a live, admin-editable data source —
  `lib/products.js` (`getProducts`/`getProduct`/`createProduct`/`updateProduct`/`deleteProduct`),
  auto-creating the table and seeding the original 3 placeholder products the first time it's
  queried against an empty table (same self-healing pattern as `enquiries`/`site_visits`).
  `config/site.js`'s `products` key now holds only the section heading/subheading — the actual
  item list is DB-backed.
- ✅ Full CRUD UI: `/admin/products` (list, with inline delete), `/admin/products/new` (create),
  `/admin/products/[id]/edit` (edit + delete), all via **Server Actions**
  (`app/admin/(protected)/products/actions.js`), not hand-rolled API routes — the modern
  idiomatic Next.js pattern, and it keeps the mutation logic colocated with the pages that use it.
  Shared `components/ProductForm.js` avoids duplicating the 5-field form across create/edit.
- ✅ **Home page switched from fully static to ISR** (`export const revalidate = 3600` in
  `app/page.js`) — necessary because products are no longer known at build time. Every mutation
  also calls `revalidatePath("/")` directly, so an admin's edit shows up on the live site
  immediately rather than waiting for the hourly window; the window is just a safety-net fallback.
- ✅ **Product images use a plain `<img>`, not `next/image`**, specifically because the image
  source is now admin-editable free-text (a local path or *any* external URL) — `next/image` hard-
  crashes the page for a URL from a hostname not explicitly allowlisted in `next.config.mjs`. No
  image upload was built (admin pastes a path/URL, same scope boundary as the rest of this pass);
  worth flagging as the natural next step if real image management is ever wanted.
- ✅ `proxy.js` gained a `PROTECTED_PREFIXES` list (parallel to `PUBLIC_PREFIXES`), used only for
  `/admin/products` — the existing `PROTECTED_ROUTES` is an *exact*-match list by design (so an
  unbuilt `/admin/xyz` correctly 401s instead of silently 404ing), but that design doesn't work
  for a route tree with genuinely dynamic children like `/admin/products/[id]/edit`. Verified this
  didn't widen protection elsewhere: `/admin/nonexistent-page` still correctly 401s.
- **Testing gotcha worth remembering**: Server Actions cannot be exercised via a plain `curl` form
  POST — Next.js invokes them through an internal action-ID protocol the browser's JS runtime
  handles, not a conventional HTML form submission. Verified this by first attempting exactly that
  (curl POST with form fields matching the input names) and confirming against the database that
  nothing was created. Real browser testing was also initially unreliable — a coordinate-based
  click on the submit button silently did nothing, seemingly intercepted by the dev-mode error
  overlay pill sitting elsewhere on the page. Switched to directly calling `form.requestSubmit()`
  via JS in the browser, which reliably invoked the real Server Action every time and is what
  finally verified create/update/delete all work correctly end-to-end, including confirming
  `revalidatePath` propagates every change to the live home page instantly.

## Blog CRUD (admin panel)

- ✅ **Moved blog posts from static `config/site.js` to a real `blog_posts` table** — same
  migration pattern as Products. `lib/blog.js` (`getPosts`/`getPostBySlug`/`getPostById`/
  `createPost`/`updatePost`/`deletePost`), self-healing table creation + seeding the original 3
  placeholder posts on first empty query. `config/site.js`'s `blog` key now holds only the
  heading/subheading. `app/blog/page.js` and `app/blog/[slug]/page.js` switched from reading
  `config/site.js` to querying the DB, both on ISR (`revalidate: 3600`).
- ✅ **`body` is one text field, not an array** — a deliberate difference from the earlier config
  shape (which had `body: [paragraph1, paragraph2, ...]`). An admin editing through a plain
  `<textarea>` naturally types multiple paragraphs separated by blank lines; splitting on
  `/\n\s*\n/` when rendering matches that mental model exactly, and avoids needing an array-editing
  UI (add/remove paragraph rows) for what is otherwise a one-field form.
- ✅ **Slugs auto-generate from the title** (`slugify()` in `lib/blog.js`) rather than being a
  free-text admin field — avoids invalid-URL slugs and keeps the form one field simpler. Collision
  handling appends `-2`, `-3`, etc. Editing a post's title regenerates its slug, and the Server
  Action explicitly calls `revalidatePath()` on **both** the old and new slug paths — otherwise the
  old URL would keep serving stale cached content indefinitely instead of correctly 404ing once
  it's no longer a valid post. Verified directly: changed a post's title, confirmed the old slug
  now 404s and the new slug serves the updated content, both within the same request cycle (no
  waiting for the ISR window).
- ✅ Same architecture as Products throughout: full CRUD via Server Actions
  (`app/admin/(protected)/blog/actions.js`), shared `components/BlogPostForm.js`, plain `<img>`
  instead of `next/image` for the same admin-editable-URL crash-risk reason, `proxy.js`'s
  `PROTECTED_PREFIXES` extended with `/admin/blog` for the dynamic `[id]/edit` route,
  `app/sitemap.js` updated to pull posts from the DB instead of static config.
- Verified end-to-end via the same `form.requestSubmit()`-in-a-real-browser method established
  while testing Products (Server Actions can't be exercised via `curl`): create (with correct
  slug auto-generation), the title-change/slug-regeneration/old-URL-404 edge case specifically,
  and delete — all confirmed against the actual database and live page responses, plus a full
  regression pass (`/`, `/admin/products`, unknown `/admin/*` paths) to confirm nothing else broke.

## Contact Us info section + admin CRUD

- ✅ **Deliberate design difference from Products/Blog: a singleton, not a list.** A business has
  one address, one phone number, one email — not a collection of many "contact records" — so this
  is Read+Update only via a single `/admin/contact` settings page, no create/delete, no list view.
  `contact_info` table always holds exactly one row (`lib/contactInfo.js` — `getContactInfo()`/
  `updateContactInfo()`), auto-seeded with placeholder defaults on first empty query, same
  self-healing pattern as everything else. This is also the first section built out for a nav link
  (`/admin/contact`) that had existed as an unbuilt placeholder since the very start of the project.
- ✅ **Enable/disable toggle, separate from the individual field values.** Turning the section off
  hides it from the home page entirely without deleting anything the admin already entered —
  verified directly: disabled it, confirmed 0 occurrences of the entered address on `/`, confirmed
  the address was still sitting in the database unchanged, re-enabled it, confirmed it came back.
  Each field is also independently optional at render time (address/phone/email each only show if
  actually filled in), so an admin can show just an email with no phone, etc., without needing a
  separate toggle per field.
- ✅ New home-page section (`id="contact-info"`), placed between the map and enquiry-form
  sections — distinct from the existing footer's WhatsApp CTA (`id="contact"`) and from
  `siteConfig.contact` (the WhatsApp number/email used for the footer button), which were both
  already there before this and are unrelated to this new block. Phone/email render as real
  `tel:`/`mailto:` links; Tabler icons (`IconMapPin`/`IconPhone`/`IconMail`) label each row.
- Verified end-to-end via the same real-browser `form.requestSubmit()` method used for Products/
  Blog: edited all three fields, confirmed the update landed in Postgres and appeared on the live
  home page instantly (no rebuild), toggled disabled/enabled, confirmed correct show/hide behavior
  each time, plus a full regression pass (`/`, `/admin/products`, unknown `/admin/*` paths).

## Not yet done: image upload for Products/Blog

Both forms currently only accept an image *path or URL* — genuinely not easy for a non-technical
client, who'd need to already have the image hosted somewhere or know how to drop a file into
`public/images/` themselves. Raised, discussed, deliberately deferred (not forgotten):

- **Why this needs real object storage, not a simple fix**: Vercel's serverless functions have a
  **read-only filesystem at runtime** (aside from an ephemeral, per-invocation `/tmp`) — writing an
  uploaded file into `public/images/` would work in local dev and then silently fail once deployed.
- **Recommended approach**: Vercel Blob — Vercel's own object storage, added to the project the
  same way Postgres was (Storage tab), works identically in local dev and production, no
  third-party account needed (unlike Cloudinary/S3/R2, which are also viable but add more setup).
- **Planned shape**: a real file input alongside the existing "paste a URL" text field on both
  `ProductForm.js` and `BlogPostForm.js` — upload if a file is chosen, otherwise fall back to the
  typed URL (fully backward compatible, doesn't remove the existing option).
- **Blocked on**: needs Vercel Blob storage actually added to the project before this can be built
  *and verified* — same as Postgres needed a real Neon database before `npm run seed` could be
  tested. Come back to this together (same step-by-step Vercel dashboard walkthrough style as the
  Postgres setup) when ready.

## Site visit analytics (country/city + daily graph)

- ✅ **Requested but deliberately NOT built: Gender and Age Group.** There is no signal in an HTTP
  request that reveals a visitor's gender or age — the only ways to get this are the visitor
  telling you directly (a form/survey) or a paid third-party ad-profiling data enrichment service
  (inaccurate, and real GDPR/CCPA exposure if shown to a client as if it were reliable). Building a
  chart with plausible-looking fabricated numbers would be actively worse than not having the
  feature, given the stated goal of showing this to prospective buyers to discuss what's real.
- ✅ **Daily visits graph (current month) + source country/city** — new `site_visits` table
  (`db/schema.sql`). A client-side beacon (`components/VisitTracker.js`, mounted in `app/page.js`)
  fires once per home-page load to `POST /api/track-visit` (public route). That route reads
  Vercel's own edge geolocation headers (`x-vercel-ip-country`, `x-vercel-ip-city`) — free,
  built-in, no third-party geo service needed, but **only populated on the real Vercel deployment**;
  local dev will always show "Unknown" since those headers don't exist outside Vercel's network.
- ✅ New `/admin/analytics` page: total visits this month, a zero-filled daily bar chart (plain
  inline SVG via `components/VisitsBarChart.js` — no new chart library dependency), top countries,
  top cities. Added to `proxy.js`'s protected routes and the admin nav. Dashboard also gained a
  "Visits this month" stat tile linking through to it, matching the enquiries tile pattern.
- **Architecture note that mattered**: `proxy.js` runs on the Edge Runtime, which cannot use `pg`
  (no raw TCP sockets there) — so visit logging could NOT happen inside the proxy itself, even
  though it already intercepts every request. Used a client-side beacon hitting a normal Node.js
  API route instead, which can use `pg` and still reads the same Vercel geo headers directly off
  the incoming request.
- Verified end-to-end: submitted visits with and without simulated geo headers, confirmed correct
  NULL vs. populated country/city in Postgres, confirmed the monthly count query matches actual
  row count, confirmed `/admin/analytics` and its API route are properly access-controlled.
- ✅ **Country → city filter.** `components/CountryFilter.js` — a `<select>` that auto-submits a
  `GET` (via the URL's `?country=` search param), so the page stays a plain server-rendered
  component with no client-side data fetching. `NULL`-country rows surface as a selectable
  "Unknown" option (mapped to `WHERE country IS NULL` server-side, since a `<select>` value can't
  literally be `NULL`). Verified against the actual DB rows: filtering by GB correctly showed only
  London/Manchester and excluded the US cities.
- ✅ **World map with visit dots — v1 (abstract).** First pass deliberately avoided any mapping
  library (Leaflet/Mapbox — heavy, usually needs an API key, pulls map tiles from a third party at
  runtime) or external map SVG (licensing to sort out), using six hand-drawn abstract continent
  blobs instead. `site_visits` gained `latitude`/`longitude` columns from Vercel's edge geo headers
  (`x-vercel-ip-latitude`/`-longitude` — same free header set as country/city, no extra service).
- ✅ **World map with visit dots — v2 (real, colorful map).** User explicitly authorized using an
  open-source library for a more realistic result, changing the trade-off calculus from v1. Tried
  `react-simple-maps` first — rejected: its React peer dependency range tops out at React 18, so it
  conflicts with this project's React 19 and installing it would need `--legacy-peer-deps`, risking
  runtime breakage since it's not RSC-aware. Used its underlying engine directly instead:
  **d3-geo** + **topojson-client** + **world-atlas** (real Natural Earth country border data,
  MIT/ISC-licensed, zero React dependency — no peer-conflict risk at all). All three are pure
  computation/data, no browser APIs, so `components/WorldMapDots.js` stays a **Server Component**
  — real, accurate country borders with zero extra client-side JS shipped. `world-atlas`'s
  `countries-110m.json` (real country shapes, ~108KB, bundled at build time — no runtime fetch) is
  converted to GeoJSON via `topojson-client`, projected with `d3-geo`'s `geoNaturalEarth1`
  projection (`.fitSize()` auto-scales/centers), rendered as colored `<path>` elements (small
  green/teal/blue palette cycling per country) on a fixed blue "ocean" background — the map keeps
  its own atlas-style colors regardless of site theme, same reasoning as the WhatsApp button
  staying brand-green. The same `projection([lng, lat])` call places the orange visit dots, so
  dots and country shapes are guaranteed to agree pixel-for-pixel (no separate approximation math
  to keep in sync, unlike v1). Verified with 7 real-world coordinates across every populated
  continent (London, New York, Tokyo, Mumbai, São Paulo, Johannesburg, Sydney) — all landed
  precisely on their correct countries, checked in both light and dark mode.
- `react-simple-maps` was installed then removed once the peer-dependency conflict was found —
  not left in `package.json`.

## Final touches (universal, client-agnostic polish)

- ✅ **Cookie/privacy consent banner.** Direct consequence of shipping real visitor tracking —
  once a site actually collects data (country, city, lat/lng), a consent notice stops being
  optional for EU/UK (GDPR) or California (CCPA) visitors. Not just decorative: `lib/consent.js` +
  `components/CookieConsent.js` + updated `components/VisitTracker.js` — tracking is genuinely
  gated on consent (opt-in, not opt-out). No consent decision yet → banner shows, nothing tracked.
  Decline → nothing tracked, no banner shown again. Accept → tracked immediately via a custom
  `window` event (no reload needed) and on every future visit via the stored `localStorage` value.
  Positioned bottom-left (not a full-width bar) specifically to avoid overlapping the bottom-right
  floating WhatsApp button. Verified in a real browser (this needs actual JS/localStorage — curl
  can't test it): 0 tracked visits before consent, 1 immediately after clicking Accept.
- ✅ **`robots.txt` + `sitemap.xml`** via Next.js's native `app/robots.js` / `app/sitemap.js`
  conventions. **Caught a real bug**: both initially returned 401 — `proxy.js`'s catch-all
  "unrecognized route → Site Unavailable" branch didn't know about them, same class of bug as the
  earlier `/api/auth/*` miss. Added both to `PUBLIC_ROUTES`. Verified after the fix: correct
  content, `/` and unknown-route 401 handling unaffected (no regression).
- ✅ **JSON-LD `LocalBusiness` structured data** (`lib/structuredData.js`), rendered on the home
  page — reuses data already in `config/site.js` (name, description, address, and the first
  review platform's rating as the `aggregateRating`, since schema.org only supports one per
  entity). This is what enables Google rich results (ratings/address in search) — no new content
  to maintain, just exposing what's already there in a machine-readable format.
- ✅ **Branded `app/error.js`** (Next.js's global error boundary), styled to match the existing
  Site Unavailable page. Real testing gotcha: `curl` cannot verify this at all — `error.js` is a
  required Client Component, and React error boundaries only render their fallback client-side
  after hydration catches the error, so the server's initial HTML response is just a minimal
  shell regardless of whether the boundary works correctly. Had to verify with an actual browser
  (temporarily forced a real page to throw, confirmed the styled fallback renders, reverted the
  test change). Also separately confirmed that testing this on a *statically* prerendered page
  breaks the build itself (an unconditional throw fails prerendering) — needed
  `force-dynamic` on the temporary test page to throw per-request instead.

## Color theme system

- ✅ `app/globals.css` has a `MASTER COLOR THEME` block — `primary`/`primary-hover`/`primary-foreground`,
  `accent`/`accent-foreground`, `surface`/`surface-alt`, `border-color`, `text-muted` (light + dark values),
  exposed as Tailwind utilities via `@theme inline` (`bg-primary`, `text-muted`, `border-border`, etc.).
- ✅ Every component (`app/page.js`, `SiteHeader`, `ThemeToggle`, `SignOutButton`, admin layout/pages,
  login, site-unavailable) was swapped from hardcoded `gray-900`/`white` Tailwind classes to these tokens.
  Deliberately left untouched: the always-dark contact footer, the WhatsApp button/icon (brand green),
  and neutral image-placeholder blocks — none of those should shift with a brand color change.
- ✅ `docs/theme-prompt-template.md` — fill-in-the-blanks prompt for recoloring a copied project: give it
  a primary color + mood, it edits the hex values in `globals.css` (components already reference the
  tokens, so that alone recolors the whole site).
- Not done: the static `mockup/*.html` files still use hardcoded Tailwind classes (they're plain Tailwind
  CDN, not the Next.js app's token system) — they'd need their own `<style>` block with matching CSS
  variables to stay in sync, not attempted here since they're just design references, not shipped code.

## Planned next (demo/pitch build-out)

Goal: not a market product — an internal tool used to demo the template to prospective clients
and scope what they'd actually want built. Priority is "looks finished and real in a walkthrough,"
not full production completeness.

1. ✅ **Blog section/page** — built. `/blog` (list) + `/blog/[slug]` (post), content as static
   entries in `config/site.js` (`blog.posts[]` — title, excerpt, date, image, body paragraphs),
   matching the existing config-driven pattern. 3 sample posts with real stock photos
   (`public/images/blog-1/2/3.jpg`). `blog: null` disables the section entirely (nav link and
   routes both go away — same optional-section convention as the rest of the config).
   - **Design decision**: blog pages get their own minimal header (`app/blog/layout.js` — logo +
     Home/Blog links only), NOT a reused `SiteHeader`. The home nav mixes anchor links
     (`#products`, only valid on the home page) with the new `/blog` page link — reusing that nav
     as-is on `/blog` would leave most items silently broken (no matching anchor on that page).
   - **Real bug caught (twice, same root cause as before)**: `/blog` initially 401'd — same
     "proxy doesn't know about this new route" issue as `/robots.txt`/`/sitemap.xml` earlier.
     Fixed by adding `/blog` to `PUBLIC_PREFIXES`.
   - **Second real bug caught**: `/blog/post-one` (a genuinely valid slug) returned 404 — same
     class of issue as the `searchParams` fix on the analytics page. Next.js 16 also makes the
     `params` prop on dynamic-route pages a **Promise**; `BlogPostPage`/`generateMetadata` were
     reading `params.slug` synchronously instead of `const { slug } = await params`, so the
     lookup silently always failed. Fixed in `app/blog/[slug]/page.js`.
   - `app/sitemap.js` updated to include `/blog` and every post URL.
   - Verified end-to-end: valid slug → 200 with correct content, invalid slug → 404 (not the
     site-wide 401 — a bad slug within a real route is a normal 404, semantically different from
     "this route doesn't exist in the app at all"), images serve, sitemap includes all 4 URLs,
     existing routes unaffected (no regression).

2. ✅ **Realistic generic imagery** — done for Products and Portfolio.
   - Downloaded 6 royalty-free stock photos (Picsum/Unsplash-sourced, fixed seeds so they're
     stable across rebuilds, not random-per-request) into `public/images/`:
     `product-1/2/3.jpg` (800×500) and `portfolio-1/2/3.jpg` (700×700).
   - `config/site.js`: each `products.items[]` entry now has an `image` field; `portfolio.items[]`
     changed shape from a bare array of numbers (`[1, 2, 3]`) to objects (`{ id, image }`).
   - `app/page.js`: both sections now render `next/image` with `fill` + `object-cover` inside a
     `relative aspect-[...]` wrapper, instead of empty gray `div`s. Verified visually in-browser —
     distinct real photos per card, correct aspect-ratio cropping, both light/dark mode fine.
   - **Deliberately NOT done**: trusted-by logos and certifications badges were left as neutral
     gray placeholders. Those slots represent company logos / certification badge graphics, not
     photography — dropping a random landscape photo into a "Google" or "ISO certified" logo slot
     would look wrong, not better. If these need real content for a demo, source actual
     logo-style/badge graphics separately, not more stock photography.
   - Filenames are intentionally generic (`product-1.jpg`, not e.g. `hot-air-balloon.jpg`) so
     swapping in a real client's photos later is a drop-in file replacement — same spirit as the
     `UPPER_SNAKE_CASE` text placeholders.
   - Not done: blog cards (blog page doesn't exist yet — item 1 below).
   - Follow-up: added real Trustpilot and Google badges to the reviews section
     (`public/logos/trustpilot.svg`, `public/logos/google.svg`, fetched from simple-icons — an
     appropriate source for this exact "nominative brand reference" use case). Unlike the
     trusted-by/certifications call above, this made sense because Trustpilot/Google are real,
     already-named platforms, not fictional placeholder clients — using their actual marks is
     standard practice for review badges. Clutch intentionally left as a placeholder (not
     requested; can add if wanted).

3. **Demo color palette** ✅ Done
   - Went further than a single static palette: shipped six selectable color themes — Ocean Blue
     (crystal glossy), Forest Green (matte), Desert Orange (rusty rock), Royal Purple (velvet
     shine), Ferrari Red (racing red + black), Golden (gold + black vibe) — each with its own
     light *and* dark variant (12 value sets total), all defined in `app/globals.css` under
     `[data-theme="..."]` / `[data-theme="..."].dark` selectors. Ocean Blue light is the default
     and lives on plain `:root`/`.dark` so the page still has color before the inline theme
     script runs.
   - New `components/ColorThemeSwitcher.js` (client component, `<select>` of the 6 names) sets
     `data-theme` on `<html>` and persists to `localStorage` under `falcon-color-theme`, mirroring
     the existing `ThemeToggle`/`falcon-theme` pattern for light/dark. `components/ThemeScript.js`
     was extended to read and apply the stored color theme synchronously (no flash).
   - Wired the switcher in next to every existing `ThemeToggle` instance: `SiteHeader` (desktop +
     mobile menu), admin layout, `/admin/login`, blog layout, `error.js`, and `/site-unavailable` —
     same coverage the dark-mode toggle already had.
   - Verified all 8 theme×mode combinations render the correct CSS variable values via browser JS
     inspection (`getComputedStyle` against `--background`/`--primary`/`--accent`), and confirmed
     `npm run build` passes.
   - No neutral gray/black default was removed — it was never separately preserved since Ocean
     Blue now serves as the fallback; if a future real client project wants to start neutral again,
     recolor `:root`/`.dark` directly per `docs/theme-prompt-template.md`.

## Gap-closing pass (generalized-template comparison)

User provided a generalized version of this template's feature set (from scoping similar
business sites) and asked to close 10 specific gaps, explicitly **without** touching theme,
color, or design. All 10 done:

- ✅ **Product category field + filter.** `products.category` (free text, no separate
  categories table), migrated onto the existing table via `ALTER TABLE ... ADD COLUMN IF NOT
  EXISTS` for DBs created before this. `getProductCategories()` returns the distinct set in
  use; a new `CategoryFilter` client component (same auto-submit-on-change pattern as the
  existing analytics `CountryFilter`) renders only when at least one category exists.
- ✅ **Product detail pages** at `/products/[id]` (numeric id, not a slug — products don't
  have a slug column, unlike blog posts). Grid cards now link there in a new tab. Added to
  `proxy.js` `PUBLIC_PREFIXES` and to `app/sitemap.js`.
- ✅ **Delete confirmations.** New reusable `components/DeleteButton.js` (client component,
  wraps the submit button with a `window.confirm()` gate that calls `preventDefault()` on
  cancel) — wired into Products, Blog, and the new Reviews admin delete actions. Verified both
  paths by overriding `window.confirm` in a real browser: cancel leaves the row untouched,
  confirm deletes it.
- ✅ **Reviews CRUD.** New `reviews` table + `lib/reviews.js`, full CRUD at `/admin/reviews`
  (list/new/edit), same Server Actions + shared-form pattern as Products. Seeded with the same
  3 placeholder platforms (Trustpilot/Google/Clutch) that used to live in `config/site.js`
  — that static `reviews.platforms` array is now removed from config; only `reviews.heading`
  stays there, matching the products/blog split.
- ✅ **About Us CRUD.** New singleton `about_info` table + `lib/aboutInfo.js` (same
  read+update-only pattern as `contact_info`, no create/delete since a business has exactly
  one About blurb), admin settings page at `/admin/about`. The static `about: {...}` key was
  removed entirely from `config/site.js` — fully DB-owned now, same as contact info.
- ✅ **Account/password settings** at `/admin/account`. Uses `useActionState` (React 19) for
  inline error/success feedback without a redirect-and-searchParams workaround. Validates the
  current password via `bcrypt.compare` before allowing a change. New `lib/admins.js` for the
  two needed queries.
- ✅ **"View site" admin link** — added to the admin header next to the theme controls, opens
  `/` in a new tab.
- ✅ **Latest posts on home page.** New "From the blog" section (only rendered when `blog` is
  enabled in config and at least one post exists), pulling the 3 most recent via a new
  `getRecentPosts()` in `lib/blog.js`.
- ✅ **Per-CTA WhatsApp messages.** Previously both WhatsApp touchpoints (floating button +
  footer CTA) shared one `contact.whatsappMessage`. Added a separate `footer.whatsappMessage`
  so the footer CTA sends a distinct, context-appropriate message while the floating button
  keeps the original generic one.
- ✅ **Identity-generation pipeline.** New `scripts/generate-identity.js` (uses `sharp`, added
  as a devDependency) — takes one source logo image and generates favicon/apple-touch-icon/
  512px-icon/OG-image variants. Deliberately writes to `public/generated/` (gitignored)
  instead of overwriting `app/icon.svg` / `public/og-image.svg` directly, so running it never
  silently changes the site's current branding — review the output and manually promote
  whichever files you want. `npm run generate-identity -- --source path/to/logo.png`.

**Real bug caught during this pass**: two brand-new tables (`about_info`, `reviews`) hit a
transient `duplicate key value violates unique constraint "pg_type_typname_nsp_index"` on
their very first concurrent `CREATE TABLE IF NOT EXISTS` — two requests both saw "table
doesn't exist" under READ COMMITTED before either committed. Self-healing on retry (the losing
transaction just doesn't create the table; the next request finds it already there) — same
theoretical race has always existed for every other self-healing table in this codebase, just
hadn't been hit before now. Not specially guarded against, consistent with the rest of the
pattern.

**Also fixed in passing**: after the `falcon-app` → `falcon-web` rename, `docker-compose`'s
project name changed too (it's derived from the folder name), which orphaned the local DB
volume under a stale `falcon-app_...` prefix and left `falcon-web-db` unable to start at all
on a port (5433) another unrelated project's container had since claimed. Moved local Postgres
to port 5434 and migrated the actual data into a correctly-prefixed `falcon-web_...` volume
(verified all 6 tables' row counts survived) — `docker-compose.yml` and all `.env*` files
updated to match.

## Team / Team Members (admin panel + "Meet our team" section)

- ✅ **Two-level CRUD, same pattern as everywhere else.** `teams` (master) and `team_members`
  (child, FK `team_id REFERENCES teams(id) ON DELETE CASCADE`). `lib/teams.js` exports
  `ensureTeamsTable()` (not just an internal helper) specifically so `lib/teamMembers.js` can
  call it first — team_members' FK needs teams to exist before its own `CREATE TABLE IF NOT
  EXISTS` can run.
  - Team fields: name, description, display order. Index page at `/admin/team` (list, new,
    edit), same Server-Actions-plus-shared-form architecture as Products/Reviews.
  - Member fields: ID No, name, title, contact number, email, service join/end date, Team
    (dropdown, populated from `getTeams()`), Active (checkbox). Index page at
    `/admin/team-members`.
  - Seeded with 1 placeholder team + 2 placeholder members on first empty query, same
    convention as every other CRUD section.
- ✅ **Delete confirmations on both**, reusing the existing `DeleteButton` component. Team's
  confirm message is dynamic — if the team still has members, it names the exact count and
  warns they'll be deleted too (`ON DELETE CASCADE` at the DB level), e.g. `Delete "Leadership"?
  This will also delete its 3 team member(s). This can't be undone.` Verified both the
  cancel-preserves and confirm-deletes paths for members, and confirmed the cascade-warning
  message text is correct, by overriding `window.confirm` in a real browser.
- ✅ **"Meet our team" public section** — new section on the home page (after About, before
  Certifications), optional via `config/site.js`'s `team` key (heading/subheading only, same
  split as products/blog/reviews). `getActiveTeamsWithMembers()` in `lib/teamMembers.js`
  returns only `active = true` members, grouped by team in team `display_order`, and the
  section only renders member **name and title** — none of the admin-only fields (ID No,
  contact info, service dates) are exposed publicly. Verified: toggling a member to Inactive
  removes them (and, if they were the only member, the whole group) from the live page
  immediately.
- **Real bug hit while testing, not a product bug**: logging in via the established
  `form.requestSubmit()`-in-browser test method intermittently failed with "Invalid email or
  password" — turned out to be a test-harness timing issue, not an auth bug. Setting
  `input.value` and dispatching `input` events immediately after `navigate()` can race React
  hydration; if the listener isn't attached yet, the native form submission fires with
  whatever's in the DOM, but the login page's `onSubmit` (which reads React state, still `""`
  at that point) intercepts it first and calls `signIn()` with empty credentials. Fixed the
  *test* by using the native `HTMLInputElement` value setter + a longer post-navigation wait
  before interacting, not the app code — confirmed via a temporary debug log in `authorize()`
  that `credentials.email`/`password` were arriving empty, then confirmed the real password
  hash was correct via `bcrypt.compare` outside the app before concluding it was a test-only
  issue.

## Membership (admin CRUD + public status verification)

- ✅ **`members` table + full admin CRUD at `/admin/members`.** Fields: Member ID (business-
  facing membership number, `UNIQUE NOT NULL` — distinct from the internal `id` PK, same split
  as `team_members.id_no`), First Name, Last Name, Mobile No, Email, Membership Status
  (`Active`/`Expired`/`Suspended`, enforced with a Postgres `CHECK` constraint, not just
  client-side validation), Address Line 1/2, City, Postcode, County, Country, Additional
  Details. Same list/new/edit + `DeleteButton` confirmation pattern as every other CRUD
  section. Seeded with 1 placeholder member (including a real postcode) so the public
  verification form has something to test against on a fresh install.
- ✅ **Public self-service verification at `/membership`, deliberately *not* a public
  directory.** The ask was "user can verify their status by inputting Last Name and Postcode"
  — built as a single-record lookup (own dedicated page, own minimal header like `/blog`'s),
  not a browsable list of every member, since a full public directory would leak every
  member's PII. `POST /api/verify-membership` (public route) calls
  `verifyMembership({ lastName, postcode })` in `lib/members.js`, which does a case-
  insensitive, whitespace-trimmed match and returns **only** `memberId`/`firstName`/
  `lastName`/`status` — never address, email, mobile, or additional details, even to a
  correctly-matching requester. A non-match returns a single generic "No matching membership
  found" message without indicating which field was wrong, to avoid making the form useful for
  enumerating valid last-name/postcode combinations. Verified: exact match returns the right
  status styled by state (green/Active, yellow/Expired, red/Suspended), a non-match returns
  the generic message, and the raw network response body was inspected directly to confirm no
  extra fields leak.
- Not rate-limited, consistent with the codebase's existing stance on `/admin/login` (no
  lockout, deliberately out of scope, documented above) — not requested here either.

## Partners (admin CRUD, wired into the existing "Trusted By" strip)

- ✅ **`partners` table + full admin CRUD at `/admin/partners`.** Fields: Partner Name, Logo
  Image (path/URL, same admin-editable-image convention as products/blog/reviews), Description,
  Status (`Active`/`Inactive`, DB `CHECK` constraint), Partnership From (date), Partnership
  Ended (date). Same list/new/edit + `DeleteButton` confirmation pattern as every other CRUD
  section.
- ✅ **Replaced the "Trusted By" section's static gray-box placeholders with real partner
  logos**, rather than building a parallel/duplicate section — the existing `trustedBy`
  config key (`{ heading, logos: [{id, name}] }`, rendered as untitled gray divs) was exactly
  the same concept the user was describing, just not yet backed by real data or images.
  Renamed to `partners` in `config/site.js` (heading only, items now DB-backed, same
  products/blog/reviews/team split), and the old unbuilt `/admin/trusted-by` admin nav
  placeholder was replaced with the real `/admin/partners` link. Only `status = 'Active'`
  partners render, via `getActivePartners()` in `lib/partners.js`. This wasn't explicitly
  requested in this exact message, so flagged clearly to the user rather than assumed silently.
  Verified: toggling a partner to Inactive removes its logo from the live strip immediately,
  and the seeded placeholder partner's logo renders correctly by default.

## News & Events (admin CRUD + public listing/detail pages)

- ✅ **One `news_events` table with a `type` discriminator (`News`/`Event`, DB `CHECK`
  constraint), not two near-duplicate tables.** News and Events share almost every field
  (title, summary, description, image, published date) — only `event_date`/`event_location`
  are Event-specific and stay `NULL` on News rows. This also avoids building something that
  would look confusingly similar to the existing Blog feature (title/excerpt/body/image/date)
  — flagged this design choice rather than silently duplicating Blog's shape. Full admin CRUD
  at `/admin/news-events` (list/new/edit + `DeleteButton` confirmation), same Server-Actions
  pattern as Blog.
- ✅ **Public listing + detail pages at `/news-events` and `/news-events/[slug]`**, mirroring
  `/blog`'s architecture exactly (own minimal header via `app/news-events/layout.js`,
  slug auto-generated from title via the same `slugify()`/`uniqueSlug()` approach, edit-time
  slug regeneration revalidates both the old and new URL paths). Event items additionally show
  a highlighted event-date/location box on the detail page and listing cards; News items don't.
  Also added a "News & Events" home page section (latest 3, mixed types with a colored badge
  per type) mirroring the existing "recent posts" section, and a `/admin/news-events` +
  `/news-events` + admin/main nav entries.
- Verified end-to-end: creating an Event with all fields (including event date/location)
  persisted correctly, editing a title regenerated the slug and made the old URL 404 while the
  new one served the updated content (same edge case verified for Blog), delete-confirm
  cancel/confirm both behave correctly, sitemap includes all news/event URLs, and the full
  access-control regression passes.

## Admin nav grouped into submenus

- ✅ `config/site.js`'s `admin.nav` had grown to 16 flat items across all the CRUD features
  built this session — grouped into dropdown submenus: **Content** (Products, Portfolio, Blog,
  News & Events, Reviews, About, Certifications), **People** (Team, Team Members, Members,
  Partners), **Insights** (Enquiries, Analytics), plus top-level Home, Contact Us, Account —
  down to 6 top-level entries. The nav data shape now supports both plain `{ label, href }`
  items and grouped `{ label, children: [...] }` items.
- ✅ New `components/AdminNavDropdown.js` (client component) renders a click-to-toggle dropdown
  for desktop (`lg` and up) — closes on selecting a link, and closes on blur once focus leaves
  the whole button+menu (not just the button, which would close it before a click on a menu
  item could register). `app/admin/(protected)/layout.js`'s mobile menu renders the same
  grouped data as a flat list with uppercase group-label headers instead of nested dropdowns,
  since the mobile panel is already a full scrollable overlay — no need for a second level of
  disclosure there.
- Verified: desktop dropdown opens/closes correctly and its links navigate (tested via the
  "Content" group → Blog), mobile menu shows all 16 items reachable under their group headers
  with no horizontal overflow at 375px, and the build/console stay clean.

## Stats CRUD

- ✅ **`stats` table + full admin CRUD at `/admin/stats`.** Fields: Value (e.g. "500+"), Label
  (e.g. "Happy customers"), Display Order — migrated off the static `stats.items` array in
  `config/site.js` the same way products/reviews/team/partners were. Same list/new/edit +
  `DeleteButton` confirmation pattern as every other section. Seeded with the same 4
  placeholder stats that used to live in config.
  - Since this section has no heading of its own (just a strip of numbers), `config.stats`
    became a plain `true`/`null` flag instead of an object with a `heading` key — the only
    config-driven section shaped this way, everywhere else keeps `{ heading, ... }`.
  - Added to the admin nav's "Content" dropdown group.
- Verified end-to-end: editing a stat's label updates the home page strip immediately, creating
  a new stat persists correctly, delete-confirm cancel/confirm both behave correctly, and the
  full access-control regression passes.

## How It Works CRUD

- ✅ **`how_it_works_steps` table + full admin CRUD at `/admin/how-it-works`.** Fields: Title,
  Description, Display Order — migrated off the static `howItWorks.steps` array in
  `config/site.js`, same pattern as Stats right before it (heading/subheading stay in config,
  the numbered step list moves to Postgres). Same list/new/edit + `DeleteButton` confirmation
  pattern as every other section; the admin list shows the same numbered-circle badge the
  public section uses, so the display order is easy to picture. Seeded with the same 3
  placeholder steps. Added to the admin nav's "Content" dropdown group, right under Stats.
- Verified end-to-end: creating a 4th step appears on the live home page immediately and numbers
  itself correctly (1-4), delete-confirm cancel/confirm both behave correctly, and the full
  access-control regression passes.

## Template conventions

- All customizable copy uses `UPPER_SNAKE_CASE` placeholders (e.g. `YOUR_HERO_HEADLINE`, `PRODUCT_1_NAME`) — find-and-replace these when starting a real project.
- Every home-page section in `mockup/home.html` is wrapped in `<!-- COMPONENT: name (required|optional) --> ... <!-- /COMPONENT: name -->` comments, so a whole section (stats, trusted-by, how-it-works, portfolio, reviews, certifications, map, floating WhatsApp button, individual social links) can be found and deleted in one cut without touching required components (header-nav, hero, products, about, contact-footer).
- When porting to the real Next.js app, keep this same required/optional split when building `config/site.js` — e.g. render a section only if its config key is present, so deleting content later doesn't require touching JSX.

## Notes

- This deviates from `CLAUDE.md`'s original description of `/` as a static "Coming Soon" page — `/` is now a real home page. `CLAUDE.md` has not yet been updated to reflect this.
- User is doing the actual implementation work themselves; Claude is providing step-by-step guidance only.
