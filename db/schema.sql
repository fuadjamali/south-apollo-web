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
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price VARCHAR(50),
  image VARCHAR(500),
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
