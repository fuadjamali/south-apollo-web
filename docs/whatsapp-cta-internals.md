# WhatsApp CTA Internals

Build reference — extracted for reuse on another site.

Every "Chat on WhatsApp" button on the site (a floating action button, a sidebar card, a footer
CTA) resolves its destination through one shared function, so an admin can point them all at
either a one-to-one number or a group invite link without touching three separate render sites.
Small feature, but the fallback-priority pattern is the reusable part. File paths are relative to
a Next.js App Router project root.

**Source stack:** Next.js 16 (App Router) · React 19 · Postgres (`pg`)

Part of the same reference series as
[`hero-partners-about-gallery-internals.md`](./hero-partners-about-gallery-internals.md),
[`site-content-sections-extended.md`](./site-content-sections-extended.md), and
[`team-people-internals.md`](./team-people-internals.md).

## Contents

- [1 · The problem](#1--the-problem)
- [2 · Schema](#2--schema)
- [3 · The shared helper](#3--the-shared-helper)
- [4 · Admin panel](#4--admin-panel)
- [5 · The three call sites](#5--the-three-call-sites)
- [6 · File manifest](#6--file-manifest)
- [7 · Porting notes](#7--porting-notes)

---

## 1 · The problem

WhatsApp supports two very different kinds of link:

- **A one-to-one chat**: `https://wa.me/<number>?text=<prefilled message>` — opens a DM with a
  specific number, optionally with a message already typed in.
- **A group invite**: `https://chat.whatsapp.com/<invite code>` — a complete, self-contained
  destination. It doesn't take a prefilled-message query string the way `wa.me` does; clicking it
  just joins (or opens) the group.

Before this feature, every "Chat on WhatsApp" button on the site built its `href` from
`whatsapp_number` + a message, inline, independently, in three different places. Adding "or a
group link instead" naively would have meant writing the same `if (groupUrl) ... else ...`
fallback logic three times — and three independent copies of the same conditional are three
chances for one of them to be edited and the other two forgotten.

## 2 · Schema

One new nullable column on the existing singleton settings table:

```sql
-- lib/socialSettings.js
ALTER TABLE social_settings ADD COLUMN IF NOT EXISTS whatsapp_group_url VARCHAR(500);
```

Added via `ALTER TABLE ADD COLUMN IF NOT EXISTS` rather than folded into the table's
`CREATE TABLE IF NOT EXISTS` — the standard lazy-migration pattern this whole codebase follows
(see the other docs in this series): an existing deployment's `CREATE TABLE IF NOT EXISTS` is a
no-op once the table already exists, so a genuinely new column needs its own `ALTER` to actually
reach deployments that were already running before the column was added.

`social_settings` itself is a singleton — always row `id = 1`, WhatsApp settings and every social
platform's URL/enabled-toggle living on the one row (see [§4](#4--admin-panel)).

## 3 · The shared helper

One function, one place, used everywhere a WhatsApp `href` is needed:

```js
// lib/socialSettings.js

// The href every "Chat on WhatsApp" button uses — one place so the three call sites (the home
// page's aside card, its footer CTA, and components/FloatingWhatsApp.js) can never drift out of
// sync. A group invite link takes priority when set — group links are already a complete
// destination, they don't take a prefilled-message query string the way a one-to-one wa.me link
// does. Falls back to the existing one-to-one wa.me/<number>?text=<message> link when no group
// link is set. Returns null when neither is configured, so callers can hide the button entirely.
export function getWhatsappHref(settings, fallbackMessage) {
  if (settings.whatsapp_group_url) return settings.whatsapp_group_url;
  if (!settings.whatsapp_number) return null;
  const message = fallbackMessage ?? settings.whatsapp_message ?? "";
  return `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`;
}
```

Three things worth noting about the shape of this function specifically:

- **Priority, not a mode flag.** There's no `whatsapp_mode: "group" | "number"` field to keep in
  sync with which field is actually filled in — the presence of `whatsapp_group_url` *is* the
  mode. One less piece of state that could disagree with itself (a `mode` set to `"group"` with
  an empty `whatsapp_group_url` would be a bug class this design doesn't have room for).
- **`fallbackMessage` is a parameter, not baked in.** Two of the three call sites want a different
  prefilled message (the floating button's own message vs. a separate footer message) — passing
  the message in rather than hardcoding `settings.whatsapp_message` inside the helper keeps it
  reusable for both without a second near-identical function.
- **Returns `null`, not `""` or `undefined`, when nothing is configured.** Every call site checks
  the return value directly in a `{href && (...)}` JSX condition — `null` reads clearly as "nothing
  to render" at each of those three sites without a separate explicit-boolean flag alongside it.

## 4 · Admin panel

One field added to the existing Social settings form, directly above the individual-number field
it takes priority over — the visual ordering itself signals which one wins:

```jsx
// components/SocialSettingsForm.js
<div>
  <label>Group chat invite link (optional)</label>
  <input
    type="url"
    name="whatsappGroupUrl"
    defaultValue={settings.whatsapp_group_url || ""}
    placeholder="https://chat.whatsapp.com/XXXXXXXXXXXXXXXXXXXXXX"
  />
  <p>
    When set, every "Chat on WhatsApp" button opens this group instead of a one-to-one chat — the
    number and messages below are ignored while this is filled in. Get an invite link from
    WhatsApp: group info → Invite via link.
  </p>
</div>
<div>
  <label>Number (with country code, no + or spaces)</label>
  <input type="text" name="whatsappNumber" defaultValue={settings.whatsapp_number || ""} />
  <p>Used only when no group link is set above — opens a one-to-one chat with this number instead.</p>
</div>
```

The Server Action layer is unchanged in shape from every other singleton-settings form in this
codebase — reads `whatsappGroupUrl` off the submitted `FormData` alongside the existing fields,
passes it straight through to `updateSocialSettings()`, and revalidates the one route (`/`) that
actually renders any of this:

```js
// app/admin/(protected)/social/actions.js
export async function updateSocialSettingsAction(prevState, formData) {
  const whatsappGroupUrl = formData.get("whatsappGroupUrl")?.toString().trim();
  // ...existing whatsappNumber/whatsappMessage/footerWhatsappMessage reads unchanged...
  await updateSocialSettings({ whatsappNumber, whatsappMessage, footerWhatsappMessage, whatsappGroupUrl, socialUrls, socialEnabled });
  revalidatePath("/");
  revalidatePath("/admin/social");
  return { success: "Social & WhatsApp settings saved." };
}
```

## 5 · The three call sites

Every place a WhatsApp button renders now calls `getWhatsappHref()` instead of building the URL
itself, and gates on its return value instead of checking `whatsapp_number` directly:

```js
// components/FloatingWhatsApp.js — the fixed floating action button
const settings = await getSocialSettings();
const href = getWhatsappHref(settings);
if (!href) return null;
```

```jsx
// app/page.js — the home page sidebar card AND the footer CTA share one computed value
const footerWhatsappHref = getWhatsappHref(
  socialSettings,
  socialSettings.footer_whatsapp_message || socialSettings.whatsapp_message
);
// ...later, twice, once per surface:
{footerWhatsappHref && (
  <a href={footerWhatsappHref} target="_blank" rel="noopener noreferrer">
    Chat on WhatsApp
  </a>
)}
```

Note the sidebar card and the footer CTA in `app/page.js` intentionally share one computed
`footerWhatsappHref` value (computed once, used at both render sites) — they're meant to always
point at the exact same destination, so there was never a reason to call the helper twice in that
file. `FloatingWhatsApp.js` calls it separately only because it's a different component file
entirely, not because it needs a different message.

## 6 · File manifest

| File | Role |
|---|---|
| `lib/socialSettings.js` | Schema (the new column), `updateSocialSettings()`, and `getWhatsappHref()` — the shared resolver |
| `app/admin/(protected)/social/actions.js` | Reads `whatsappGroupUrl` from the form, passes it through |
| `components/SocialSettingsForm.js` | The admin field + its "this overrides the number below" help text |
| `components/FloatingWhatsApp.js` | The fixed floating button — one of the three call sites |
| `app/page.js` | The home page sidebar card and footer CTA — the other two call sites, sharing one computed href |

## 7 · Porting notes

- **This is additive to whatever WhatsApp-number setup already exists** — if the target site
  already has a `wa.me` link built from a stored number, the port is: add the column, add
  `getWhatsappHref()`, then replace each inline `https://wa.me/${number}?text=...` construction
  with a call to it. No call site needs new props or a different component shape, just a
  different source for the same `href` string.
- **The priority-by-presence pattern generalizes** beyond WhatsApp — anywhere a site might offer
  "a specific thing, or a fallback general thing" (a per-page contact email overriding a global
  one, a per-product support link overriding a store-wide one), the same shape applies: one
  nullable override field, one small resolver function, zero separate mode flag to keep in sync.
- **No new library** — this is pure string-building and one Postgres column, same as every other
  small setting in this codebase.

---

*WhatsApp CTA internals — reference doc, portable to any Next.js + Postgres project.*
