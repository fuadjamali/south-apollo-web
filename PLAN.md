# falcon-app — Build Plan

## Pages

- `/` — Home, public. Real home page branded "Falcon App" (usable for marketing later, not just a static placeholder).
- `/admin/login` — public login form, calls `signIn("credentials", ...)`.
- `/admin` — protected, minimal dashboard. Shared admin layout adds a section-wise nav (Home, Trusted By, Products, Portfolio, Reviews, About, Certifications, Contact Us) mapping to `config/site.js` keys, plus sign-out. Nav links point to future per-section edit routes (not built yet) — groundwork for letting the admin edit site content instead of hardcoding it.
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
- Still open: no rate limiting/lockout on `/admin/login`, no password-reset flow (re-seed only), enquiry form has no submit handler yet.

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

1. **Blog section/page**
   - `/blog` (list) + `/blog/[slug]` (post) — new routes.
   - Content source: start with static entries in `config/site.js` (or a small `content/blog/*`
     folder of plain objects/MDX) rather than a database table — matches the existing
     config-driven pattern, avoids scoping a full CMS just for the demo.
   - List page: card grid (title, excerpt, date, image) reusing the existing card/token styling.
   - Post page: heading, date, body content, back-to-blog link.
   - Add a "Blog" link to `SiteHeader` nav and `config/site.js` nav array — mark optional
     (`blog: null` to disable) like the other sections.

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

3. **Demo color palette**
   - Right now `app/globals.css` ships the neutral gray/black default — fine as a template
     baseline, but flat for a pitch demo.
   - Pick one attractive, finished-looking palette (not client-specific branding) and apply it via
     the existing `docs/theme-prompt-template.md` workflow, so the demo actually looks designed
     rather than like unstyled scaffolding.
   - Keep the neutral default recoverable — e.g. note the original hex values here or in a comment,
     since the neutral palette is still the right *starting* point for a real client project.

## Template conventions

- All customizable copy uses `UPPER_SNAKE_CASE` placeholders (e.g. `YOUR_HERO_HEADLINE`, `PRODUCT_1_NAME`) — find-and-replace these when starting a real project.
- Every home-page section in `mockup/home.html` is wrapped in `<!-- COMPONENT: name (required|optional) --> ... <!-- /COMPONENT: name -->` comments, so a whole section (stats, trusted-by, how-it-works, portfolio, reviews, certifications, map, floating WhatsApp button, individual social links) can be found and deleted in one cut without touching required components (header-nav, hero, products, about, contact-footer).
- When porting to the real Next.js app, keep this same required/optional split when building `config/site.js` — e.g. render a section only if its config key is present, so deleting content later doesn't require touching JSX.

## Notes

- This deviates from `CLAUDE.md`'s original description of `/` as a static "Coming Soon" page — `/` is now a real home page. `CLAUDE.md` has not yet been updated to reflect this.
- User is doing the actual implementation work themselves; Claude is providing step-by-step guidance only.
