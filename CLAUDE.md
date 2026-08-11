# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

This repository is currently empty — scaffolding has not started yet. This file describes the intended
architecture from the project brief so setup can resume consistently. Update this file once real code,
scripts, and config exist (re-run project init at that point for accurate commands and structure).

## Intended stack

- Next.js (App Router) + React
- PostgreSQL — local via Docker for dev, Vercel Postgres for production
- Auth.js (NextAuth) with a Credentials provider for admin login, JWT session strategy
- Styling: Tailwind CSS (recommended)
- Deploy target: Vercel

## Intended routes and access control

- `/` — Home page, public, "Coming Soon" placeholder
- `/admin/login` — Login page, public
- `/admin` — Admin page, protected (requires a valid session)
- Any other/unrecognized route — returns HTTP 401 and renders a "Site Unavailable" page

Access control is enforced centrally in `middleware.js`:
- `/` and `/admin/login` are always accessible
- `/admin` and any future protected routes require a valid session, else redirect to `/admin/login`
- Any route not matching a known public/protected pattern returns 401 with the "Site Unavailable" page

## Data model

- `admins` table (Postgres): `id`, `email`, `password_hash`
- A seed script inserts one admin with a bcrypt-hashed password

## Environment configuration

- `.env.example` / `.env.local.example` hold placeholders for `DATABASE_URL`, `NEXTAUTH_SECRET`, and other
  local vs. production values — copy to `.env.local` for local dev, never commit real secrets
- Local Postgres is defined in `docker-compose.yml`

## Original project brief

```
Create an MVP template project called "falcon-app" with:
Stack:
- Next.js (App Router) + React
- PostgreSQL (local via Docker for dev, Vercel Postgres for production)
- Auth.js (NextAuth) with Credentials provider for admin login
- Deploy target: Vercel
Pages:
1. Home Page (public) - route: / - displays a "Coming Soon" page (simple centered message/logo, no real content yet)
2. Login Page (public) - route: /admin/login
3. Admin Page (protected, requires login) - route: /admin
4. Site Unavailable Page (401) - shown for any route that isn't Home, Login, or an authenticated Admin route
Requirements:
- Set up middleware.js so that:
  - "/" (Home) and "/admin/login" are always accessible
  - "/admin" and any future protected routes require a valid session, else redirect to /admin/login
  - Any other unrecognized/future route returns a 401 status and renders the "Site Unavailable" page
- Create an `admins` Postgres table (id, email, password_hash) with a seed script to insert one admin with a bcrypt-hashed password
- Auth.js config using Credentials provider, JWT session strategy
- Basic clean layout/styling (plain CSS or Tailwind — recommend Tailwind for speed)
- Include a docker-compose.yml for local PostgreSQL
- Include .env.example and .env.local.example with placeholders for DATABASE_URL, NEXTAUTH_SECRET, etc. (local vs production values)
- Add a simple README with setup steps (Docker for local dev) + Vercel deployment steps
Keep it minimal and clean — this is a starting template, not a full production app yet.
```
