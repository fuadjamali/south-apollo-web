# Falcon Web — Package Plans

Client-facing pricing tiers. Each tier maps directly to a `PLAN` value enforced in the
codebase (see `docs/developer-notes.md` → "Plan tiers") — what's sold is what's actually
locked, not just a sales description.

## At a glance

| | **Basic** | **Plus** | **Premium** |
|---|:---:|:---:|:---:|
| Positioning | Brochure site | Content, credibility & booking | Commerce & accounts |
| Setup fee | £300–£350 | £500–£600 | £750–£900 |
| Monthly | £19–£25 | £35–£45 | £55–£75 |

Ranges, not fixed prices — land nearer the top for clients wanting a lot of initial content
migrated/written for them, nearer the bottom for a lighter, mostly-self-serve setup.

## Feature comparison

| Module | Basic | Plus | Premium |
|---|:---:|:---:|:---:|
| Home page (hero, stats, how-it-works, about, map) | ✅ | ✅ | ✅ |
| Contact info block + enquiry form (→ admin inbox) | ✅ | ✅ | ✅ |
| WhatsApp CTA (floating + footer) + social links | ✅ | ✅ | ✅ |
| Products **or** Portfolio showcase (pick one at onboarding) | ✅ | ✅ | ✅ |
| Both Products **and** Portfolio | — | ✅ | ✅ |
| Color theme | 1 fixed theme | Full 8-theme switcher + dark mode | Full 8-theme switcher + dark mode |
| Basic analytics (visit counter) | ✅ | ✅ | ✅ |
| Blog | — | ✅ | ✅ |
| Gallery | — | ✅ | ✅ |
| News & Events | — | ✅ | ✅ |
| Reviews (third-party ratings) + Partners strip | — | ✅ | ✅ |
| Customer-submitted reviews (public form → admin moderation) | — | ✅ | ✅ |
| Team & Team Members | — | ✅ | ✅ |
| Certifications | — | ✅ | ✅ |
| "Write with AI" content assistant (admin panel) | — | ✅ | ✅ |
| Online booking / appointment scheduling (real-time slots) | — | ✅ | ✅ |
| Booking waitlist for fully-booked dates | — | ✅ | ✅ |
| Shopping cart + checkout + order management | — | — | ✅ |
| Discount / promo codes at checkout | — | — | ✅ |
| Member login portal (signup/login/password reset, order history) | — | — | ✅ |
| Membership verification (`/membership` lookup) | — | — | ✅ |
| GDPR account closure (member request → admin-reviewed anonymization) | — | — | ✅ |
| Admin CRUD + Detail Views | Included sections only | Included sections only | All sections |

## Who each tier suits

**Basic** — a business that just needs a credible online presence: what they do, how to reach
them, one showcase of products or work. Reads as a static brochure site to a visitor, but it's
not literally static — it's Postgres-backed with a real (if minimal) admin panel, so the client
can edit their own about text, swap products, and see visit counts without calling a developer.
No ongoing content pipeline (no blog/gallery), no booking, no online payment. Good fit: sole
trader, freelancer, small local business with nothing to actively manage day-to-day.

**Plus** — "get found, get booked." A business actively marketing itself: publishing updates,
showing off work and team, collecting social proof (reviews, partner logos) — plus, for
appointment-based businesses (salons, clinics, consultants, trades), taking bookings online
instead of by phone. Booking here is schedule-only: it fills the calendar, it doesn't collect
payment — the business still gets paid in person, by invoice, or bank transfer after the
appointment. Enquiries and WhatsApp remain the contact route for everything else.

**Premium** — "sell online, build a returning customer base." Adds actual e-commerce
infrastructure on top of everything Plus has: cart → order (the business follows up to arrange
payment — no payment gateway is integrated yet, see note below) and persistent customer
accounts (order history, booking history, membership status). Don't pitch Premium as "the
revenue tier" as if Plus has none — a Plus business booking appointments is already generating
revenue through the site; Premium is specifically about online goods sales and repeat-customer
accounts.

## Honest caveats to set expectations with a client

- **No online payment gateway yet — anywhere, not just cart.** Premium's cart is "place an
  order, we'll be in touch to arrange payment," and Plus's booking is "reserve a slot, pay in
  person" — neither collects a card today. Fine for a handful of hands-on managed clients;
  don't sell either as "just like Shopify/Calendly with deposits." If a client specifically
  wants paid bookings (e.g. a deposit to hold a slot), that's the same unbuilt payment-gateway
  work as cart checkout — treat it as a bespoke Premium add-on, not something either tier does
  out of the box today.
- **Setup isn't self-serve.** Every tier still needs you to provision the client's Vercel
  project, database, and Blob store, and set `PLAN` before deploy — see
  `docs/developer-notes.md` → "Deploying a new client site." Price accordingly.
- **Upgrades are simple.** Moving a client from Basic → Plus → Premium later is just changing
  their `PLAN` env var and redeploying — no code changes, no data migration. Worth mentioning
  to clients as a low-friction upsell path, not a re-build.
- **Booking is one shared calendar, not multi-staff.** It suits a sole practitioner or a
  business that can only serve one customer at a time — not a salon with several stylists
  who each need their own independent calendar.
- **The AI assistant needs its own API key** (`ANTHROPIC_API_KEY`, an Anthropic account,
  pay-as-you-go usage cost) — factor that into ongoing costs if a client wants it.

## Sources

Feature set and pricing rationale from earlier discussion in this project; enforcement details
in `lib/plan.js` and `proxy.js`. Update this file if the tier/module mapping ever changes —
keep it in sync with `docs/developer-notes.md`.
