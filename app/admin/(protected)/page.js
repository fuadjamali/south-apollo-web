import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import siteConfig from "@/config/site";

export const dynamic = "force-dynamic";

async function getEnquiryCount() {
  try {
    const result = await db.query("SELECT COUNT(*)::int AS count FROM enquiries");
    return result.rows[0]?.count ?? 0;
  } catch {
    return 0;
  }
}

async function getDbStatus() {
  try {
    await db.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

async function getVisitsThisMonth() {
  try {
    const result = await db.query(
      "SELECT COUNT(*)::int AS count FROM site_visits WHERE created_at >= date_trunc('month', now())"
    );
    return result.rows[0]?.count ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminPage() {
  const [session, enquiryCount, dbConnected, visitCount] = await Promise.all([
    getServerSession(authOptions),
    getEnquiryCount(),
    getDbStatus(),
    getVisitsThisMonth(),
  ]);

  const loginAt = session?.user?.loginAt ? new Date(session.user.loginAt) : null;

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-foreground">
          {siteConfig.admin.dashboardHeading}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {siteConfig.admin.dashboardSubheading}
        </p>
        <p className="mt-4 text-sm text-foreground">{session?.user?.email}</p>
        {loginAt && (
          <p className="mt-1 text-xs text-muted">Signed in since {loginAt.toLocaleString()}</p>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <a
          href="/admin/enquiries"
          className="rounded-xl border border-border bg-surface p-6 text-center shadow-sm transition hover:shadow-md"
        >
          <p className="text-3xl font-extrabold text-foreground">{enquiryCount}</p>
          <p className="mt-1 text-sm text-muted">
            {enquiryCount === 1 ? "Enquiry" : "Enquiries"} received
          </p>
        </a>

        <a
          href="/admin/analytics"
          className="rounded-xl border border-border bg-surface p-6 text-center shadow-sm transition hover:shadow-md"
        >
          <p className="text-3xl font-extrabold text-foreground">{visitCount}</p>
          <p className="mt-1 text-sm text-muted">
            {visitCount === 1 ? "Visit" : "Visits"} this month
          </p>
        </a>

        <div className="rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
          <p className="flex items-center justify-center gap-2 text-lg font-bold text-foreground">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                dbConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {dbConnected ? "Connected" : "Unavailable"}
          </p>
          <p className="mt-1 text-sm text-muted">Database status</p>
        </div>
      </div>
    </div>
  );
}
