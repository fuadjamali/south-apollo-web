import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS site_visits (
      id SERIAL PRIMARY KEY,
      path VARCHAR(255) NOT NULL,
      country VARCHAR(100),
      city VARCHAR(100),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await db.query(`ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;`);
  await db.query(`ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;`);
}

function parseCoord(value) {
  const num = value ? parseFloat(value) : null;
  return Number.isFinite(num) ? num : null;
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const path = typeof body.path === "string" ? body.path.slice(0, 255) : "/";

  // Populated by Vercel's edge network on real deployments; absent in local dev.
  const country = request.headers.get("x-vercel-ip-country");
  const cityHeader = request.headers.get("x-vercel-ip-city");
  const city = cityHeader ? decodeURIComponent(cityHeader) : null;
  const latitude = parseCoord(request.headers.get("x-vercel-ip-latitude"));
  const longitude = parseCoord(request.headers.get("x-vercel-ip-longitude"));

  await ensureTable();

  await db.query(
    "INSERT INTO site_visits (path, country, city, latitude, longitude) VALUES ($1, $2, $3, $4, $5)",
    [path, country, city, latitude, longitude]
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}
