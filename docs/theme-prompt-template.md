# Theme color prompt template

Copy the block below into a new project (copied from this `falcon-app` template),
fill in the bracketed parts, and paste it as a prompt to Claude Code.

---

```
Update this project's color theme based on the brand input below.

Brand input:
- Primary color: [e.g. "#0F766E" or "deep teal"]
- Accent color (optional, for links/highlights — leave blank to auto-pick a
  complementary color): [ ]
- Mood/style: [e.g. "clean and corporate" / "warm and playful" / "bold and modern"]
- Any colors to avoid: [ ]

Do this:

1. Open `app/globals.css` and find the "MASTER COLOR THEME" comment block. This
   file defines the site's entire palette as CSS custom properties in `:root`
   (light mode) and `.dark` (dark mode), which Tailwind exposes as utilities
   (`bg-primary`, `text-primary-foreground`, `bg-surface`, `bg-surface-alt`,
   `border-border`, `text-muted`, `bg-accent`, `text-accent-foreground`, etc.)
   via the `@theme inline` block. Update ONLY the hex values in `:root` and
   `.dark` — don't rename tokens or touch the `@theme inline` mapping.

   - `--primary` / `--primary-hover` / `--primary-foreground`: main brand
     color for buttons, active nav state, CTAs, and its readable-contrast
     foreground color.
   - `--accent` / `--accent-foreground`: secondary highlight color for links,
     badges, focus states.
   - `--surface` / `--surface-alt`: card backgrounds / alternating section
     backgrounds.
   - `--border-color`: hairline borders and dividers.
   - `--text-muted`: secondary/supporting text color.
   - Pick `.dark` values that keep the same brand identity but stay legible
     on a near-black background — don't just reuse the light-mode hex codes.
   - Check contrast: text/icon color placed on a colored background (e.g.
     `--primary-foreground` on `--primary`) must stay readable (roughly
     WCAG AA, ~4.5:1 for body text).

2. The components in `app/`, `components/`, and `app/admin/` already use the
   theme tokens (`bg-primary`, `text-primary-foreground`, `bg-surface`,
   `bg-surface-alt`, `border-border`, `text-muted`, etc.) instead of hardcoded
   Tailwind grays — this was done as part of MVP Template V1, so step 1 alone
   should be enough to recolor the whole site. Do a quick search for
   `gray-900`, `gray-800`, `gray-700`, `gray-500`, `gray-400` across `app/`
   and `components/` as a sanity check; if you find any, it means either this
   project drifted from the template or a new component was added without
   using the tokens — replace those with the matching token from the table
   below rather than leaving them hardcoded.

   | Hardcoded (old)                                  | Token (new)              |
   | ------------------------------------------------- | ------------------------ |
   | `bg-gray-900 dark:bg-white`                        | `bg-primary`             |
   | `text-white dark:text-gray-900`                    | `text-primary-foreground`|
   | `hover:bg-gray-700 dark:hover:bg-gray-200`         | `hover:bg-primary-hover` |
   | `bg-gray-50 dark:bg-gray-900` (section backgrounds)| `bg-surface-alt`         |
   | `bg-white dark:bg-gray-900` (card backgrounds)     | `bg-surface`             |
   | `border-gray-200/300 dark:border-gray-700/800`     | `border-border`          |
   | `text-gray-600/500 dark:text-gray-400`             | `text-muted`             |

   Note: the always-dark contact footer (`bg-gray-900 dark:bg-black`), the
   WhatsApp button/icon (brand green), and neutral image-placeholder blocks
   (`bg-gray-100/200 dark:bg-gray-700/800`) are deliberately NOT tied to these
   tokens — leave them as-is unless the brand input specifically asks to
   change them.

3. Leave `app/icon.svg`, `mockup/logo.svg`, and `public/og-image.svg` fill
   colors as-is unless the brand input explicitly asks for a re-colored logo.

4. After editing, run `npm run build` to confirm nothing broke, then start
   `npm run dev` and visually check the home page, admin login, and admin
   dashboard in both light and dark mode before calling it done.
```

---

## Notes

- This assumes the target project still has the `MASTER COLOR THEME` block in
  `app/globals.css` as shipped in `falcon-app` MVP Template V1 — if that file
  has since been restructured, adjust the instructions accordingly.
- Keep the fill-in-the-blanks section short. A single primary color plus a
  one-line mood description is usually enough for Claude to derive a
  reasonable full palette (hover states, dark-mode variants, accent color).
