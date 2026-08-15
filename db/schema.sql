CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enquiries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Country/city come from Vercel's edge geolocation headers (x-vercel-ip-country,
-- x-vercel-ip-city) — only populated when actually deployed on Vercel, NULL in local dev.
-- No gender/age columns: that data cannot be derived from an HTTP request at all
-- (see PLAN.md for why it was deliberately left out rather than faked).
-- latitude/longitude also come from Vercel's edge headers (x-vercel-ip-latitude/-longitude),
-- used to plot visits on the world map on /admin/analytics.
CREATE TABLE IF NOT EXISTS site_visits (
  id SERIAL PRIMARY KEY,
  path VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  city VARCHAR(100),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin-editable via /admin/products. Seeded with the 3 placeholder products from
-- config/site.js the first time this table is queried and found empty (see lib/products.js).
-- Each product also has a public detail page at /products/[id]. `category` powers the
-- home page's category filter dropdown (free text, not a separate categories table).
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price VARCHAR(50),
  image VARCHAR(500),
  category VARCHAR(100),
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin-editable via /admin/blog. Seeded with the 3 placeholder posts from config/site.js
-- the first time this table is queried and found empty (see lib/blog.js). `body` is one
-- text block — paragraphs are separated by a blank line and split on render, same as an
-- admin would naturally type multiple paragraphs into a plain textarea.
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  body TEXT,
  image VARCHAR(500),
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Singleton (always exactly one row) — a business has one address/phone/email, not a list of
-- many, so this is Read+Update only via /admin/contact, no create/delete. `enabled` lets the
-- admin hide the whole public section without losing the entered details. Auto-seeded with
-- placeholder defaults on first empty query (see lib/contactInfo.js).
CREATE TABLE IF NOT EXISTS contact_info (
  id SERIAL PRIMARY KEY,
  heading VARCHAR(255) NOT NULL DEFAULT 'Contact Us',
  subheading TEXT,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin-editable via /admin/reviews. Seeded with the 3 placeholder platforms (Trustpilot/
-- Google/Clutch) that used to live in config/site.js the first time this table is queried
-- and found empty (see lib/reviews.js).
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  platform_name VARCHAR(100) NOT NULL,
  rating VARCHAR(10),
  review_count VARCHAR(50),
  url VARCHAR(500),
  logo VARCHAR(500),
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Singleton (always exactly one row), same pattern as contact_info — a business has one
-- About Us blurb, not a list. Admin-editable via /admin/about.
CREATE TABLE IF NOT EXISTS about_info (
  id SERIAL PRIMARY KEY,
  heading VARCHAR(255) NOT NULL DEFAULT 'About Us',
  body TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin-editable via /admin/team. Grouping parent for team_members. Seeded with 1 placeholder
-- team the first time this table is queried and found empty (see lib/teams.js).
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin-editable via /admin/team-members. `active = false` hides a member from the public
-- "Meet our team" section without deleting their record. team_id cascades on delete — removing
-- a team removes its members too (the admin delete confirmation warns about this).
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  id_no VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  contact_no VARCHAR(50),
  email VARCHAR(255),
  service_join_date DATE,
  service_end_date DATE,
  team_id INT REFERENCES teams(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
