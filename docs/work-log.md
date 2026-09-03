# Work Log

Hours are estimated from commit-timestamp clusters (a burst of commits close together implies
one continuous work session; a multi-hour gap implies a break), not a real timer — treat these
as approximate, not billing-precise. Add a new dated entry per work session; keep the newest at
the top.

## 2026-09-03 (~2h 45m)

- **07:07 – 09:14** (~2h 10m) — Hero section mobile fixes (image/heading collision, optional
  mobile-specific hero image, iterated on in-flow vs. behind-text placement); shipped Vision &
  Mission and History as new optional home page modules; added image upload (left/right/behind
  text) to About Us; extracted the shared `ImageTextSection`/`ImageTextSectionForm` components;
  documented the pattern in `developer-notes.md`.
- **16:30 – 17:10** (~35 min) — Added the business name to the admin login page.

## 2026-09-02 (~2h 30m, estimated)

- **~11:59** — Added multi-photo product galleries (up to 8 photos/product) with crop, rotate,
  and aspect-ratio cropping; direct-to-Blob upload; admin photo manager; public lightbox. Single
  commit but the largest feature of the two days — actual time on this one is likely
  understated by the commit-cluster method above.
- **21:04 – 22:19** (~1h 15m) — Rolled the crop/rotate/straighten tool out to all 12 admin image
  forms (previously Products-only); fixed a real production race in product cover-photo
  selection; fixed the product photo lightbox close button; validated crop output against a
  silent-broken-upload edge case; documented the day's work.

---

**Running total: ~5h 15m** across both days.
