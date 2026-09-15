# Hero, Partners, About & Gallery Internals

Build reference — extracted for reuse on another site.

Everything the Hero carousel, Partners "Trusted by" strip, About Us section, and Gallery do,
admin panel through public render, so all four can be rebuilt on another site without
re-deriving the design decisions. File paths throughout are relative to a Next.js App Router
project root.

**Source stack:** Next.js 16 (App Router) · React 19 · Postgres (`pg`) · Vercel Blob ·
`react-easy-crop` · Tailwind CSS v4

## Contents

- [Shared stack & conventions](#shared-stack--conventions)
- [1 · Hero carousel](#1--hero-carousel)
- [2 · Partners](#2--partners)
- [3 · About](#3--about)
- [4 · Gallery](#4--gallery)
- [5 · Shared image pipeline](#5--shared-image-pipeline)
- [6 · Library reference](#6--library-reference)
- [7 · Porting checklist](#7--porting-checklist)

---

## Shared stack & conventions

Three patterns repeat across all four sections (and everywhere else in the codebase) — worth
porting as house rules, not just copying the four features in isolation.

### Pattern: lazy, additive schema — no migrations directory

Every feature module owns its own table via an `ensureTable()` call, run at the top of every
read/write function: `CREATE TABLE IF NOT EXISTS` for the base shape, then one
`ALTER TABLE ... ADD COLUMN IF NOT EXISTS` per field added later. A field added six months after
launch reads as a second `ALTER TABLE` line, not a new migration file. `CREATE TABLE IF NOT
EXISTS` is *not* atomic in Postgres — concurrent first-request callers can race, so
table-creation swallows the specific duplicate-object error codes (`23505`, `42P07`) rather than
treating them as failures.

### Pattern: Server Actions + targeted revalidation

Create/update/delete are plain `"use server"` functions passed straight to a `<form action=>` —
no client-side fetch/JSON layer. Every mutation ends by calling `revalidatePath()` on exactly the
public routes that render the data (home page, the feature's own public page, its admin list) and
then `redirect()`s back to the admin list. Next's default cache otherwise leaves an edit invisible
on the live site until the next deploy.

A **list** section (Hero, Partners, Gallery — create/edit/delete rows) follows this redirect
shape; a **singleton** section with one form and nothing to navigate back to from (About, see
[§3](#3--about)) uses `useActionState` instead — same revalidation call, but the action returns an
`{ error }`/`{ success }` object the form renders inline rather than redirecting anywhere.

### Pattern: one upload helper, every image field

Hero, Partners, About, and Gallery — and every other admin image field in the app — go through the
same `lib/blob.js` pair: `uploadImage(file, folder)` and `deleteImage(url)`, backed by
`@vercel/blob`. An update that replaces an image deletes the old blob only *after* the new one
uploads successfully, so a failed upload never orphans a still-referenced file. Full pipeline in
[§5](#5--shared-image-pipeline).

---

## 1 · Hero carousel

A full-bleed banner at the top of the home page. Zero admin-configured slides never happens
(always seeded); exactly one slide renders with no carousel chrome at all — same markup as a plain
static hero; two or more slides activate autoplay, swipe, keyboard nav, and a progress indicator
automatically.

### Schema — `hero_slides` table

```sql
CREATE TABLE hero_slides (
  id SERIAL PRIMARY KEY,
  display_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  heading TEXT NOT NULL,
  subheading TEXT,
  media_type VARCHAR(10) NOT NULL DEFAULT 'image',   -- 'image' | 'video'
  background_image VARCHAR(500),
  background_image_mobile VARCHAR(500),         -- optional separate portrait crop
  background_video VARCHAR(500),
  primary_cta_label VARCHAR(100),
  primary_cta_href VARCHAR(255),
  secondary_cta_label VARCHAR(100),
  secondary_cta_href VARCHAR(255),
  overlay_strength VARCHAR(10) NOT NULL DEFAULT 'medium',  -- light | medium | dark
  text_style VARCHAR(10) NOT NULL DEFAULT 'auto',          -- auto | light | dark
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Ordering is a plain integer column, not an array or a linked list — `ORDER BY display_order ASC,
id ASC` everywhere it's read. A reorder action rewrites every row's `display_order` to its new
index inside one transaction.

### Admin — list, reorder, create/edit, toggle, delete

- **List page** — thumbnail (image or muted video preview), heading, media-type label, an
  Active/Inactive toggle button (a one-field server action, not a full edit round-trip),
  Edit/Delete. Wrapped in a drag-and-drop reorder list component that posts the full new ordering
  on drop.
- **Create/edit form** — one shared component for both routes (`slide` prop is `null` on create).
  An Image/Video toggle switches which upload field renders; the selected type is carried as a
  hidden `mediaType` input.
- **Media resolution on save** — the trickiest piece of the action layer: a slide can switch from
  image to video (or back) between saves. The action deletes whichever blob(s) belong to the media
  type being *abandoned*, and independently handles "uploaded a new file" vs. "checked remove, keep
  nothing" vs. "left it alone, keep the existing URL" for each of the three possible media fields.
- **Link fields** use a destination picker (a `<select>` of known internal pages/anchors, with a
  "Custom link…" escape hatch for any external URL) instead of a bare text input — makes a typo'd
  href structurally impossible for anything on the known list.

```js
// app/admin/(protected)/hero/actions.js
async function resolveMedia(formData, existing) {
  const mediaType = formData.get("mediaType") === "video" ? "video" : "image";

  if (mediaType === "video") {
    // upload / remove-checkbox / keep-existing tri-state for the video field
    // ...then: if the slide *used to* be an image, delete both old image blobs
    if (existing && existing.media_type !== "video") {
      await deleteImage(existing.background_image);
      await deleteImage(existing.background_image_mobile);
    }
    return { mediaType, backgroundImage: null, backgroundImageMobile: null, backgroundVideo };
  }
  // mirror image: same tri-state for image + mobile-image, delete old video if switching away
}
```

### Render — `components/HeroCarousel.js`

Client component. Only active slides reach it (`getActiveHeroSlides()` filters server-side).
Behavior, all built on plain `useState`/`useEffect` — no carousel library:

- **Autoplay** — a `setInterval` advances the index every 7s, cleared and restarted whenever slide
  count, pause, tab-visibility, or reduced-motion state changes. Paused on mouse-enter, when
  `document.hidden` (backgrounded tab), and entirely skipped under
  `prefers-reduced-motion: reduce`.
- **Crossfade, not slide** — every active slide's media stays mounted simultaneously, stacked
  absolutely, opacity-transitioned (700ms). This means the *next* slide's image/video never has to
  fetch on-transition; the tradeoff is loading every slide's asset up front, acceptable for a
  handful of slides.
- **Ken Burns pan/zoom** — a CSS `@keyframes` block (injected inline, computed per-render from the
  autoplay duration) scales the active slide's media from 1.0 → 1.08 over the slide's dwell time.
- **Touch swipe** — raw `touchstart`/`touchend` coordinate delta, >50px horizontal move
  advances/retreats. No gesture library.
- **Keyboard** — arrow-left/right on the section advance the carousel when it's focused.
- **Segmented progress bar** — one pill per slide; the active one's inner bar animates width
  0→100% over the autoplay duration via inline `animationName`/`animationPlayState` (longhand
  properties, deliberately not the `animation` shorthand — mixing shorthand and its own longhand
  across re-renders is a real React footgun, see note below). Clicking a segment jumps straight to
  that slide.
- **Mobile-specific image** — if a slide has a separate `background_image_mobile`, it renders via
  `sm:hidden` / `hidden sm:block` pairing instead of one `<img>` resized by CSS, so phones download
  the smaller, purpose-cropped asset instead of the full desktop one.
- **Video slides** — muted, looped, `playsInline`; play()/pause() driven imperatively off which
  slide is active, so only the on-screen video ever actually decodes.
- **Overlay + text-style system** — shared with any other full-bleed text-on-image section (e.g. an
  About banner): `overlay_strength` picks how dark a scrim sits over the media (a theme-token-based
  `bg-background/N` class, never a raw hex, so it works across every color theme *and* light/dark
  mode); `text_style` lets an admin force light or dark text when the scrim alone isn't enough
  contrast for a particular photo.

> **React gotcha worth carrying over:** when an inline `style` object sets both a CSS shorthand
> (`animation`) and one of its own longhands (`animationPlayState`) across re-renders that happen
> every tick, React can warn and silently drop a later update. Set every animation sub-property
> individually instead of the shorthand whenever the values change on every render.

### File manifest

| File | Role |
|---|---|
| `lib/heroSlides.js` | Schema, CRUD, ordering, seed/migration from a legacy singleton table |
| `lib/overlaySettings.js` | Shared overlay-strength / text-style enums + their Tailwind class maps |
| `app/admin/(protected)/hero/page.js` | List + drag-reorder + active toggle |
| `app/admin/(protected)/hero/actions.js` | Server actions — create, update, delete, reorder, toggle |
| `app/admin/(protected)/hero/new/page.js`, `.../[id]/edit/page.js` | Thin wrappers around the shared form |
| `components/HeroSlideForm.js` | Create/edit form (image↔video toggle, both upload fields, CTA fields) |
| `components/HeroCarousel.js` | Public render — all carousel behavior described above |
| `components/NavReorderableList.js` | Generic drag-and-drop list, reused from site-nav ordering |
| `components/NavDestinationField.js` | CTA link picker (known destinations + custom-URL escape hatch) |

---

## 2 · Partners

The "Trusted by" strip near the bottom of the home page — a simple admin-editable logo list, worth
documenting mainly for its two smallest, easy-to-miss decisions: an admin-controlled sort order
instead of alphabetical, and an optional click target that turns a plain logo card into a link
without a second component.

### Schema — `partners` table

```sql
CREATE TABLE partners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo VARCHAR(500),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Active'
    CHECK (status IN ('Active', 'Inactive')),
  partnership_from DATE,
  partnership_ended DATE,
  display_order INT NOT NULL DEFAULT 0,     -- admin-set, not alphabetical
  link_url VARCHAR(500),                    -- optional — internal path or external URL
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Only `status = 'Active'` rows reach the public page (`getActivePartners()`) — `Inactive` keeps a
lapsed partner's record and history in the admin list without pulling its logo off the live site.
Both the admin list and the public strip sort by `display_order ASC, id ASC` — a plain integer,
same pattern as Hero's slide ordering, edited as a single number field rather than a
drag-and-drop list (a handful of partner logos changes rarely enough that a number field is less UI
to ship for the same result).

### Admin — form fields & the action-link picker

- **Name, logo, description** — logo goes through the same `ImageFileInput` pipeline as every
  other image field ([§5](#5--shared-image-pipeline)), no restricted crop ratio (logos vary too
  much in native shape to force one).
- **Status + partnership dates** — Active/Inactive select, plus two optional dates (from/ended)
  kept for the admin's own record-keeping; neither date drives any public behavior on its own,
  `status` is what actually hides a card.
- **Action link** — reuses `NavDestinationField`, the exact same known-destination-or-custom-URL
  picker Hero's CTA buttons use ([§1](#1--hero-carousel)). Passed `required={false}` with a "— No
  link (card isn't clickable) —" empty option, since most partner logos are just a credibility
  badge with nothing to click through to.
- **Display order** — plain `type="number"` input, "lower shows first" in the help text under it.

```jsx
// components/PartnerForm.js
<NavDestinationField
  name="linkUrl"
  defaultValue={partner?.link_url || ""}
  required={false}
  noneLabel="— No link (card isn't clickable) —"
/>
```

### Home page render — conditional element type, not a wrapper

The one genuinely reusable trick here: instead of always wrapping each card in an `<a>` (and
disabling it with CSS when there's no link — a common but messier pattern), the card's element type
itself switches between `"a"` and `"div"` based on whether `link_url` is set, with the link-only
props spread in only when they apply:

```jsx
// app/page.js
const CardTag = partner.link_url ? "a" : "div";
const cardProps = partner.link_url
  ? {
      href: partner.link_url,
      // external links open in a new tab; internal nav stays in the same one
      ...(partner.link_url.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {}),
    }
  : {};

return (
  <CardTag key={partner.id} {...cardProps} className="...">
    {/* logo + name + description, identical either way */}
  </CardTag>
);
```

A no-link card never renders an inert `<a>` with no `href` (bad for keyboard/screen-reader users,
who'd tab into a link that goes nowhere) and never needs a second, near-duplicate card component
for the "not clickable" case.

Layout is a plain responsive grid — `grid-cols-1 sm:grid-cols-3` — one column on phones, three side
by side from the `sm:` breakpoint up; no library, no manual wrapping logic.

### File manifest

| File | Role |
|---|---|
| `lib/partners.js` | Schema, CRUD, active-only public query |
| `app/admin/(protected)/partners/*` | List / new / edit / actions.js |
| `components/PartnerForm.js` | Admin create/edit form |
| `app/page.js` | Public render — the "Trusted by" grid section, conditional `<a>`/`<div>` card |
| `components/NavDestinationField.js` | Shared with Hero — the action-link picker |

---

## 3 · About

One admin-editable "heading + body + optional image" block — but the most interesting code here
isn't About's alone: the same schema shape, the same admin form, and the same public renderer are
shared verbatim by two sibling sections, Vision & Mission and History. The renderer's real trick is
reading structure back out of what's still just one free-form text field.

### Schema — `about_info` table (singleton)

```sql
CREATE TABLE about_info (
  id SERIAL PRIMARY KEY,
  heading VARCHAR(255) NOT NULL DEFAULT 'About Us',
  body TEXT,
  image VARCHAR(500),
  image_position VARCHAR(6) NOT NULL DEFAULT 'left',     -- left | right | behind
  overlay_strength VARCHAR(10) NOT NULL DEFAULT 'medium', -- only matters for 'behind'
  text_style VARCHAR(10) NOT NULL DEFAULT 'auto',         -- only matters for 'behind'
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

A singleton, not a list — always exactly one row, id fixed at `1`, inserted with
`ON CONFLICT (id) DO NOTHING` the first time anything reads it (same pattern as the site's
business-info row). `overlay_strength`/`text_style` reuse the exact enum + Tailwind-class map
Hero's scrim system already defines (`lib/overlaySettings.js`, [§1](#1--hero-carousel)) rather than
a second copy of the same three-value choice.

### Admin — `components/ImageTextSectionForm.js`, shared by 3 sections

One form component, parameterized rather than duplicated for its three callers
(`/admin/about`, `/admin/vision-mission`, `/admin/history`): heading, body, optional image
(through the standard crop pipeline, [§5](#5--shared-image-pipeline), fixed at a 4:5 crop), and a
left/right image-position radio group. About is the only caller that passes
`allowBehindPosition`, which adds a third radio option ("Behind the text") plus the
overlay-strength/text-style selects that mode needs — Vision & Mission and History keep exactly
the two plainer options they always had.

```jsx
// app/admin/(protected)/about/page.js
<ImageTextSectionForm
  data={about}
  action={updateAboutInfoAction}
  aiEnabled={aiEnabled}
  allowBehindPosition        // the one flag About sets that its siblings don't
  hidesWhenBodyEmpty={false}  // About always shows; siblings hide until written
/>
```

Save uses `useActionState`, not a redirect — see the "Server Actions + targeted revalidation"
pattern above. There's also an inline "AI Assistant" button next to the body field on every
`ImageTextSectionForm` instance when the site's AI module is enabled, out of scope for this doc but
worth knowing the hook (`targetId` pointing at the textarea's id) is already there if the target
site has the same feature.

### Render — `components/ImageTextSection.js`, content-shape detection

The genuinely reusable idea in this file: rather than adding admin fields for "is this a timeline"
or "is this a feature list," three small parsers pattern-match the plain body text itself and
upgrade it to a richer layout only when it actually has that shape — anything else falls through to
an ordinary paragraph, so an admin never has to opt into anything or learn a markup syntax.

```
admin types plain text → 3 parsers try to match its shape → cards / timeline / icon list / plain paragraph
```

- **`splitMissionVision(body)`** — matches `"Our Mission … Our Vision …"` (case-insensitive) and
  renders two side-by-side cards instead of one wall of text. This is Vision & Mission's shape, not
  About's, but the detector lives in this shared file so any of the three sections gets it if its
  content happens to match.
- **`parseTimeline(body)`** — splits the body into paragraph blocks, looks for two or more
  consecutive blocks starting with a loose `"<date-ish text ending in a year>: "` prefix
  ("August 5, 2024:", "End of Feb-2026:", "Early 2025:" all qualify — deliberately loose so an
  admin isn't forced into one exact date format), and renders those as a connected vertical
  timeline with everything before/after kept as intro/outro paragraphs. This is History's shape.
- **`parseFeatureList(body)`** — same paragraph-block splitting, looking for three or more
  consecutive `"Short Label: what it means"` blocks, rendered as an icon list (6 icons, cycled by
  index — not tied to the label text, since labels are free-form). Requires 3+ specifically so it
  never fires on Vision & Mission's exact 2-block Mission/Vision shape, which the first parser
  already owns. This is About's own typical shape — a run of "Career Guidance & Mentoring: …",
  "Housing Support: …" style paragraphs.

Whichever parser matches (if any) picks the inner content renderer (`MissionVisionCards` /
`Timeline` / `FeatureList`) — and that choice is *orthogonal* to the outer layout, decided
separately by `image_position`:

- **No image** — centered, text-only, `max-w-4xl` (or wider — `max-w-5xl`/`max-w-3xl` — once a
  parser matches, since a 2-up card grid or a timeline wants more room than a single paragraph
  column).
- **`image_position: "left" | "right"`** — a two-column `md:grid-cols-2` layout, image in a glassy
  rounded frame with a soft gradient glow behind it, text (in whichever shape a parser picked)
  alongside. Image is always first in DOM order (stacks on top below `md:`) regardless of
  "left"/"right", which is purely a desktop-only `md:order-2` flip — so there's no risk of the
  image colliding with a long body on mobile, the same reasoning as Hero's own mobile-image
  fallback.
- **`image_position: "behind"`** — reuses Hero's exact full-bleed-background recipe
  ([§1](#1--hero-carousel)): `object-contain object-bottom` below `sm:`, `object-cover
  object-center` from `sm:` up, plus the overlay-strength scrim and text-style color system. The
  image itself renders at a fixed 45% opacity on top of the admin's own overlay — a full-strength
  photo behind a long timeline or card grid reads as visual noise, not a backdrop, so it's
  deliberately dimmed further than Hero's own background image is.

Every card/timeline/list sub-component also takes an `onImage` flag that swaps its surface from the
theme's normal glassy card (`glass-surface`, background-tinted) to a translucent white-on-blur
treatment — the theme surface tint reads muddy layered over a photo, white glass reads correctly
regardless of which of the site's color themes or light/dark mode is active.

### File manifest

| File | Role |
|---|---|
| `lib/aboutInfo.js` | Singleton schema + get/update — same shape as `lib/visionMissionInfo.js`, `lib/historyInfo.js` |
| `lib/overlaySettings.js` | Shared with Hero — overlay-strength / text-style enums + class maps |
| `app/admin/(protected)/about/page.js`, `.../actions.js` | Admin page + the useActionState-style save action |
| `components/ImageTextSectionForm.js` | Shared admin form — About, Vision & Mission, History |
| `components/ImageTextSection.js` | Shared public renderer — 3 layouts × 3 content-shape parsers |
| `app/page.js` | Mounts `<ImageTextSection>` once per enabled section, passing each its own Postgres row |

---

## 4 · Gallery

Three different renders of one photo table: a masonry browser at `/gallery` with filters and
infinite scroll, an auto-scrolling filmstrip preview embedded on the home page, and a shared
click-to-zoom lightbox used by both.

### Schema — `gallery_photos` table

```sql
CREATE TABLE gallery_photos (
  id SERIAL PRIMARY KEY,
  image VARCHAR(500) NOT NULL,
  caption VARCHAR(255),
  aspect_ratio VARCHAR(10) NOT NULL DEFAULT '1:1',   -- '1:1' | '4:5' | '16:9' | '9:16'
  photo_date DATE NOT NULL DEFAULT CURRENT_DATE,      -- admin-editable, drives sort order
  tags TEXT[] NOT NULL DEFAULT '{}',                -- lowercased, free-text
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Sorted everywhere by `photo_date DESC, id DESC` — an admin can backdate an older photo on upload
and have it land chronologically instead of always at the top. `tags` is a plain Postgres array,
not a join table: cheap because it's a filter facet, not a relation anything else needs to query
from the other direction.

### Admin — CRUD + tags + date + crop ratio

- Upload requires committing to a crop ratio up front — the image field only offers
  **Portrait (9:16)** or **Landscape (16:9)** (see [§5](#5--shared-image-pipeline)'s crop modal),
  and that choice is written to `aspect_ratio` so every render downstream knows the photo's box
  shape without inspecting the file itself.
- Tags field is one comma-separated text input; the action lowercases, trims, and de-duplicates via
  a `Set` before writing the array.
- Date field defaults to today; the gallery re-sorts on save.

### Public — `/gallery` masonry, filters, infinite scroll

- **Masonry layout** — pure CSS multi-column flow (`columns-1 sm:columns-2 lg:columns-3` +
  `break-inside-avoid` on each card), not a JS packing library. Each photo keeps its real aspect
  ratio and stacks tightly down its column, so a landscape photo next to a portrait one doesn't
  leave a gap under it the way a fixed-height grid would.
- **Filters** — tag pills (counts computed server-side, most-used first), a Year dropdown that
  reveals a Month dropdown once a year is picked, and a debounced (350ms) free text search matching
  caption *or* any tag. All four compose — filters are ANDed in one SQL query (below), not combined
  client-side.
- **Infinite scroll** — an `IntersectionObserver` on a 1px sentinel div below the grid,
  `rootMargin: "800px"` so the next page starts loading well before the visitor actually reaches
  the bottom. A request-id ref discards any in-flight fetch that's since been superseded by a newer
  filter change.
- **API route** — `/api/gallery-photos`, a plain `GET` handler wrapping `getPhotosPage()`, capped
  at 60 per request regardless of what the client asks for.

```sql
-- lib/gallery.js — getPhotosPage()
SELECT * FROM gallery_photos
WHERE ($1::text IS NULL OR $1 = ANY(tags))
  AND ($2::int IS NULL OR EXTRACT(YEAR FROM photo_date) = $2)
  AND ($3::int IS NULL OR EXTRACT(MONTH FROM photo_date) = $3)
  AND ($4::text IS NULL OR caption ILIKE '%' || $4 || '%'
       OR EXISTS (SELECT 1 FROM unnest(tags) t WHERE t ILIKE '%' || $4 || '%'))
ORDER BY photo_date DESC, id DESC LIMIT $5 OFFSET $6
```

Fetches `limit + 1` rows and slices off the extra one to learn whether a next page exists, instead
of a separate `COUNT(*)` query.

### Home page — auto-scrolling filmstrip + lightbox

The same `GalleryGrid` component renders three ways off one `layout` prop — `masonry` (above),
`grid` (plain equal columns), and `slider` (home page preview, most recent photos):

```
photo list, doubled back-to-back → flex row, fixed height, auto width →
translateX(0) → translateX(-50%) → seamless loop point
```

- The animated track renders the photo array *twice*, concatenated. Since both halves are
  pixel-identical, animating exactly one full copy's width (`-50%` of the doubled track) makes the
  loop point invisible — no easing hack, no reset flicker.
- Each card is a fixed height with auto width (aspect-ratio preserved via inline `style`), so
  portrait and landscape photos sit naturally side by side without the section ever growing tall.
- Duration scales with photo count (`photos.length × 4.5s`) so a filmstrip of 20 photos doesn't
  race past at the same speed as one of 4.
- Sliding is skipped — falls back to a static, horizontally scrollable row — for a single photo or
  under `prefers-reduced-motion`.
- Hovering the track pauses the CSS animation (`animation-play-state`) so a visitor can actually
  read a caption without it sliding away mid-hover.

**Lightbox** (shared by all three layouts): click any photo to open a fullscreen overlay with
scroll-to-zoom, double-click to toggle 1×/2.2×, drag-to-pan once zoomed, two-finger pinch on touch,
arrow-key/button prev-next, and a focus-trapped overlay so Escape/arrows work the instant it opens
without an extra click into it first.

### File manifest

| File | Role |
|---|---|
| `lib/gallery.js` | Schema, CRUD, paginated/filtered query, tag counts, year/month timeline |
| `lib/photoAspectRatios.js` | The 4 crop-ratio presets (value, CSS aspect-ratio, label) — shared with product photos |
| `app/admin/(protected)/gallery/*` | List / new / edit / actions.js |
| `components/GalleryPhotoForm.js` | Admin create/edit form — image, caption, date, tags |
| `app/gallery/page.js` | Public page — server-fetches page 1 + tag counts + timeline |
| `components/GalleryBrowser.js` | Client — filters, debounce, infinite scroll, re-fetch orchestration |
| `app/api/gallery-photos/route.js` | Pagination API the browser calls after the first page |
| `components/GalleryGrid.js` | The 3-layout renderer + shared lightbox — used by `/gallery` *and* the home page |

---

## 5 · Shared image pipeline

Both features — and every other admin image field in the app, Partners' logo and About's optional
image included — funnel through the same four-stage client pipeline before a single byte reaches
the server.

```
pick file → compress if >4.5MB → crop modal → canvas export → Server Action → Vercel Blob
```

- **`ImageFileInput`** — the file `<input>` every form uses. On change: rejects non-images
  client-side, and if the raw file exceeds Vercel's 4.5MB Server Action body cap, auto-compresses
  it *before* the crop step even opens (a user should never have to go compress a phone photo
  themselves first).
- **`compressImageFile`** — canvas re-encode: tries decreasing JPEG quality (0.9 → 0.5) at the
  original dimensions first, then decreasing dimensions 15% per pass (floor 800px on the long edge)
  if quality alone can't hit the target size. Returns the smallest attempt either way, even if it
  never quite fits, so the caller can decide whether that's good enough.
- **`ImageCropModal`** — wraps `react-easy-crop`: aspect-ratio picker (caller restricts which
  ratios are offered — Gallery only offers 9:16/16:9), 90°-rotate buttons, a ±45° straighten
  slider, and an "Use original, uncropped" escape hatch. Zoom is clamped to a computed minimum so
  straightening or rotating never reveals a gap at the crop box's corners (trig derivation in the
  code comment, verified to the ±45° extreme).
- **`getCroppedImageBlob`** — draws the rotated source onto an offscreen canvas, then the crop
  rectangle onto a second canvas capped at 1600px on the long edge, exports as JPEG(0.9). Rejects a
  suspiciously small result (<200 bytes) as a failed crop rather than silently uploading a
  near-blank image.
- **`uploadImage(file, folder)`** — the only place `@vercel/blob` is called from. Sanitizes the
  filename, namespaces by folder (`hero/…`, `gallery/…`), lets Blob add a random suffix to avoid
  collisions.

> **Order matters:** compression runs before the crop modal opens, not after — so the crop tool
> always works with an already browser-manageable image, and the final crop export (capped at
> 1600px) is usually smaller still. A single very large source photo never has to be held in memory
> twice at full resolution.

---

## 6 · Library reference

Every third-party package either feature touches, and exactly what it's used for — nothing here is
load-bearing for the carousel/gallery logic itself except `react-easy-crop` and `@vercel/blob`.

| Package | Used for | Version |
|---|---|---|
| `react-easy-crop` | The crop/pan/zoom interaction inside `ImageCropModal` — the one genuinely load-bearing UI library in this pipeline. | ^6.2.3 |
| `@vercel/blob` | `put()` / `del()` — object storage for every uploaded image and video. | ^2.8.0 |
| `@tabler/icons-react` | Prev/next chevrons, zoom-in cue, photo/video placeholder icons in the admin list. | ^3.46.0 |
| `pg` | Raw SQL against Postgres — no ORM. Every query above is written by hand. | ^8.23.0 |
| `next` | App Router, Server Actions, `revalidatePath`, file-based routing for the API pagination route. | 16.3.0 |
| `react` / `react-dom` | Carousel and lightbox state — plain hooks, no animation or carousel library. | 19.2.8 |
| `tailwindcss` | All layout/styling, including the masonry `columns-*` utilities and the hand-written `@keyframes` for Ken Burns / marquee / progress-fill. | ^4 |

Notably *absent*: no carousel library (Swiper, Embla, Splide), no masonry library (Masonry.js,
react-masonry-css), no animation library (Framer Motion, GSAP), no lightbox library
(yet-another-react-lightbox, PhotoSwipe). Every one of those behaviors above is hand-rolled in
plain CSS/JS — smaller bundle, but worth knowing before you assume a dependency is missing from
this list.

---

## 7 · Porting checklist

Concrete order of operations to stand all four sections up on a different Next.js site.

1. **Storage & DB first** — Provision Vercel Blob (or swap `lib/blob.js`'s `put`/`del` for another
   object-storage SDK) and a Postgres connection — every schema above assumes `db.query()` exists.
2. **Copy the pipeline before the features** — `lib/cropImage.js`, `lib/compressImage.js`,
   `lib/photoAspectRatios.js`, `components/ImageCropModal.js`, `components/ImageFileInput.js`,
   `lib/blob.js` — all four sections (and any future image field) depend on this set as a unit.
3. **Hero: schema → actions → form → carousel** — Port `lib/heroSlides.js` and
   `lib/overlaySettings.js` first (no UI dependency), then the admin action/form pair, then
   `HeroCarousel.js` last — it's the only piece with no server dependency once slide data exists.
4. **Partners: the quick one** — Smallest of the four — port `lib/partners.js`, then the
   form/actions/list, then the home page grid section. If Hero is already ported,
   `components/NavDestinationField.js` is already in place for the action-link field; if Partners
   comes first, port that field from [§1](#1--hero-carousel) along with it.
5. **About: schema → shared form/renderer → wire the siblings** — Port `lib/aboutInfo.js`, then
   `ImageTextSectionForm.js` + `ImageTextSection.js` together — they're one unit, not two. Getting
   only About running costs the same as getting About, Vision & Mission, and History all running:
   the other two are the same files with a different Postgres row and `allowBehindPosition` left
   off.
6. **Gallery: schema → grid → browser → API route** — `lib/gallery.js` first, then
   `GalleryGrid.js` (works with any static photo array — test it before wiring live filtering),
   then `GalleryBrowser.js` + the `/api/gallery-photos` route together, since the browser is
   useless without its API counterpart.
7. **Route-protection allowlist** — If the target site has any kind of centralized
   middleware/route-guard, remember any new public route (the gallery API route, any new page)
   needs adding there explicitly — a route that "exists" in the file tree but isn't allowlisted
   404s or redirects regardless of what the component renders.
8. **Re-tune the two hardcoded constants** — `AUTOPLAY_MS` (7000) in `HeroCarousel.js` and
   `SLIDE_SECONDS_PER_PHOTO` (4.5) in `GalleryGrid.js` are the only "design decision" numbers baked
   into the code — everything else reads from the database.

---

*Hero, Partners, About & Gallery internals — reference doc, portable to any Next.js + Postgres +
Vercel Blob project.*
