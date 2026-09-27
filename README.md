# South Apollo Web

A minimal MVP template: a public marketing home page, an admin login, and a protected admin
dashboard — built as a starting point, not a full production app.

## Stack

- Next.js (App Router) + React
- PostgreSQL (Docker for local dev, Vercel Postgres for production)
- Auth.js (NextAuth) — Credentials provider, JWT sessions
- Tailwind CSS v4

## Pages

| Route           | Access                          |
| --------------- | -------------------------------- |
| `/`              | Public — home page                |
| `/admin/login`   | Public — admin login form         |
| `/admin`         | Protected — requires a session    |
| any other route  | 401 "Site Unavailable"            |

Access control is enforced centrally in `proxy.js`.

## Local setup

1. **Start Postgres:**

   ```bash
   docker-compose up -d
   ```

   Runs Postgres on `localhost:5433` (not 5432 — see note below) with credentials matching
   `.env.local.example`.

2. **Copy env files:**

   ```bash
   cp .env.local.example .env.local
   ```

   Generate a real secret and paste it into `NEXTAUTH_SECRET`:

   ```bash
   openssl rand -base64 32
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Seed one admin user:**

   ```bash
   npm run seed
   ```

   Creates the `admins` table and inserts one bcrypt-hashed admin. Defaults to
   `admin@example.com` / `changeme123` — override with env vars:

   ```bash
   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD=your-password npm run seed
   ```

5. **Run the dev server:**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000). Sign in at `/admin/login` with the
   seeded credentials.

### Why port 5433, not 5432?

`docker-compose.yml` maps Postgres to `5433` on the host. If your machine already runs a native
Postgres install on the default `5432`, Docker's mapping can silently lose the port to it. Change
it back to `5432:5432` (and update `DATABASE_URL` in your env files to match) if you don't have
anything else on that port.

## Customizing the template for a real project

Almost all page content lives in `config/site.js` — business name, hero copy, products,
portfolio, reviews, social links, etc. Edit that file rather than the page components. Sections
marked optional in that file can be removed entirely by setting their key to `null` (e.g.
`stats: null`), which removes them from the rendered page without touching JSX.

Static reference mockups (plain HTML, no build step) are in `mockup/` if you want to preview
layout/copy changes quickly outside of Next.js.

## Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket and import it into [Vercel](https://vercel.com/new).
2. Add a [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) database to the
   project and copy its connection string.
3. In the Vercel project's Environment Variables, set:
   - `DATABASE_URL` — the Vercel Postgres connection string
   - `NEXTAUTH_SECRET` — a freshly generated secret (`openssl rand -base64 32`), different from
     your local one
   - `NEXTAUTH_URL` — your production URL (e.g. `https://your-app.vercel.app`)
4. Run the seed script against production once, pointed at the Vercel Postgres connection string
   (e.g. via `vercel env pull` locally, then `npm run seed`), to create the first admin.
5. Deploy.

## Author

MVP developed by Fuad Jamali — fuad06@gmail.com

© 2026 Fuad Jamali. All rights reserved.
