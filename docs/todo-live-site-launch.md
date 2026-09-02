# To-Do: Live Site Launch — Compliance & Client Acquisition

Compiled after reviewing the live production site (falcon-web-puce.vercel.app) for UK
compliance and for how well it lands with a general (non-technical) business owner. Nothing
in this list has been actioned except where marked done — review and decide what to pursue.

## Legal / Compliance

- [x] Draft Privacy Policy & Terms of Service and save them at `/admin/legal` (done — saved,
      currently unpublished)
- [ ] Read and review both drafts at `/admin/legal`
- [ ] Confirm data hosting region (Neon/Vercel dashboard) — determines whether the "may be
      stored outside UK/EEA" line in the Privacy Policy stays or gets removed
- [ ] Get a cheap solicitor / LawBite-style review of the legal text before publishing
- [ ] Publish both pages (tick "Publish this page" at `/admin/legal`) once happy
- [ ] Register with the ICO (~£40–60/yr) if collecting enquiry/order data as a data
      controller — check if already registered
- [ ] Verify the cookie banner actually blocks tracking until accepted, not just displays a
      notice while analytics fires anyway

## Trust & Credibility (biggest lever)

- [ ] Land the first 1–2 real clients and swap in a real name/logo/quote for the fictional
      team, reviews, and case studies — matters more than anything else on this list
- [ ] Until then, decide whether the fictional reviews/team/case studies risk reading as
      bait-and-switch to a sharp prospect, and whether that trade-off is acceptable for now

## Conversion / Funnel

- [x] Add a response-time commitment to the enquiry form copy (done — "Ready to build your
      website? ... we'll reply within 24 hours" live at `/#enquiry`)
- [x] Consider a more concrete, less clever-first hero line for a 5-second skim (done —
      "Fast to start. Easy to upgrade to bookings and online orders.")
- [x] "Get started" pricing buttons reworded to "Get my free quote" (homepage + compare-plans)
- [ ] Use the site's own booking feature on the "Get started" CTA — link to a bookable call
      instead of (or alongside) the static enquiry form; doubles as a live product demo. Two
      candidate booking services drafted (name/description/icon) but not yet wired up as real
      bookable services — see `docs/free-consultation-icon.svg` and
      `docs/demo-planning-icon.svg`

## Content Clarity

- [ ] Simplify or restructure the compare-plans table — 18 rows of checkmarks is accurate but
      dense for a non-technical owner; consider a "highlights only" view with the full table
      as a toggle/expand
- [ ] Reconsider the stats strip — lead with owner-relevant numbers ("48hrs to go live") over
      infrastructure-relevant ones ("99.9% uptime," "22+ modules")

## Outreach (not code — separate track)

- [ ] Identify the first outreach channel (chambers of commerce, LinkedIn, local SMB groups,
      walking into shops) and start sending the live link instead of a deck
- [ ] Build a repeatable pre-launch checklist (business details, legal pages, cookie consent,
      data hosting) for future client deploys, once doing this per-client
