import { db } from "@/lib/db";
import VisitsBarChart from "@/components/VisitsBarChart";
import CountryFilter from "@/components/CountryFilter";
import WorldMapDots from "@/components/WorldMapDots";

export const dynamic = "force-dynamic";

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

async function getAnalytics(selectedCountry) {
  try {
    await ensureTable();

    // selectedCountry is "Unknown" for NULL-country rows, a real country name, or absent (no filter).
    const cityFilter =
      selectedCountry === "Unknown"
        ? "WHERE country IS NULL"
        : selectedCountry
          ? "WHERE country = $1"
          : "";
    const cityParams = selectedCountry && selectedCountry !== "Unknown" ? [selectedCountry] : [];
    const cityLimit = selectedCountry ? 50 : 8;

    const [totalResult, dailyResult, countryResult, filterOptionsResult, cityResult, mapResult] =
      await Promise.all([
        db.query(
          "SELECT COUNT(*)::int AS count FROM site_visits WHERE created_at >= date_trunc('month', now())"
        ),
        db.query(`
          SELECT gs.day::date AS day, COUNT(sv.id)::int AS count
          FROM generate_series(date_trunc('month', now()), date_trunc('day', now()), interval '1 day') AS gs(day)
          LEFT JOIN site_visits sv ON date_trunc('day', sv.created_at) = gs.day
          GROUP BY gs.day
          ORDER BY gs.day
        `),
        db.query(`
          SELECT COALESCE(country, 'Unknown') AS country, COUNT(*)::int AS count
          FROM site_visits
          GROUP BY country
          ORDER BY count DESC
          LIMIT 8
        `),
        db.query(`
          SELECT DISTINCT COALESCE(country, 'Unknown') AS country
          FROM site_visits
          ORDER BY country
        `),
        db.query(
          `
          SELECT COALESCE(city, 'Unknown') AS city, COALESCE(country, '') AS country, COUNT(*)::int AS count
          FROM site_visits
          ${cityFilter}
          GROUP BY city, country
          ORDER BY count DESC
          LIMIT ${cityLimit}
        `,
          cityParams
        ),
        db.query(`
          SELECT latitude, longitude, city, country
          FROM site_visits
          WHERE latitude IS NOT NULL AND longitude IS NOT NULL
          ORDER BY created_at DESC
          LIMIT 300
        `),
      ]);

    return {
      total: totalResult.rows[0]?.count ?? 0,
      daily: dailyResult.rows.map((r) => ({
        day: new Date(r.day).getDate(),
        count: r.count,
      })),
      countries: countryResult.rows,
      countryOptions: filterOptionsResult.rows.map((r) => r.country),
      cities: cityResult.rows,
      mapPoints: mapResult.rows.map((r) => ({
        lat: r.latitude,
        lng: r.longitude,
        label: [r.city, r.country].filter(Boolean).join(", ") || "Unknown",
      })),
    };
  } catch {
    return { total: 0, daily: [], countries: [], countryOptions: [], cities: [], mapPoints: [] };
  }
}

export default async function AnalyticsPage({ searchParams }) {
  const params = await searchParams;
  const selectedCountry = params?.country || "";
  const { total, daily, countries, countryOptions, cities, mapPoints } =
    await getAnalytics(selectedCountry);

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Site Visits</h1>
        <p className="mt-1 text-sm text-muted">
          {total} visit{total === 1 ? "" : "s"} this month.
        </p>

        {daily.length > 0 ? (
          <div className="mt-6">
            <VisitsBarChart data={daily} />
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span>Day 1</span>
              <span>Today</span>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted">
            No visit data yet. Geolocation (country/city) only populates on the live Vercel
            deployment — local dev will show &quot;Unknown&quot;.
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="font-semibold text-foreground">Top Countries</h2>
          {countries.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No data yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {countries.map((c) => (
                <li key={c.country} className="flex justify-between">
                  <span className="text-foreground">{c.country}</span>
                  <span className="text-muted">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-foreground">
              Top Cities{selectedCountry ? ` — ${selectedCountry}` : ""}
            </h2>
            {countryOptions.length > 0 && (
              <CountryFilter countries={countryOptions} selected={selectedCountry} />
            )}
          </div>
          {cities.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No data yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {cities.map((c) => (
                <li key={`${c.city}-${c.country}`} className="flex justify-between">
                  <span className="text-foreground">
                    {c.city}
                    {c.country ? `, ${c.country}` : ""}
                  </span>
                  <span className="text-muted">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="font-semibold text-foreground">Visitor Locations</h2>
        {mapPoints.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            No mapped visits yet. Latitude/longitude only populate on the live Vercel deployment.
          </p>
        ) : (
          <div className="mt-4">
            <WorldMapDots points={mapPoints} />
          </div>
        )}
      </div>
    </div>
  );
}
