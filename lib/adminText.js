import { db } from "@/lib/db";

// Text shown on the admin panel's own login and dashboard pages — used to live as hardcoded
// strings in config/site.js (siteConfig.admin.loginHeading etc.).
async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_text (
        id INT PRIMARY KEY,
        login_heading VARCHAR(255) NOT NULL,
        login_subheading VARCHAR(255) NOT NULL,
        dashboard_heading VARCHAR(255) NOT NULL,
        dashboard_subheading VARCHAR(255) NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // See lib/sectionHeadings.js's ensureTable comment — concurrent first-time
    // "CREATE TABLE IF NOT EXISTS" callers can race under Postgres.
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
}

// Seed values — this deployment's real current text (the old config/site.js defaults).
const DEFAULTS = {
  loginHeading: "Admin login",
  loginSubheading: "Sign in to manage your site.",
  dashboardHeading: "Dashboard",
  dashboardSubheading: "You're signed in as an admin.",
};

async function ensureRow() {
  await ensureTable();
  await db.query(
    `INSERT INTO admin_text (id, login_heading, login_subheading, dashboard_heading, dashboard_subheading)
     VALUES (1, $1, $2, $3, $4)
     ON CONFLICT (id) DO NOTHING`,
    [
      DEFAULTS.loginHeading,
      DEFAULTS.loginSubheading,
      DEFAULTS.dashboardHeading,
      DEFAULTS.dashboardSubheading,
    ]
  );
}

export async function getAdminText() {
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM admin_text WHERE id = 1");
  return rows[0];
}

export async function updateAdminText({
  loginHeading,
  loginSubheading,
  dashboardHeading,
  dashboardSubheading,
}) {
  await ensureRow();
  await db.query(
    `UPDATE admin_text SET login_heading = $1, login_subheading = $2, dashboard_heading = $3,
     dashboard_subheading = $4, updated_at = now() WHERE id = 1`,
    [loginHeading, loginSubheading, dashboardHeading, dashboardSubheading]
  );
}
