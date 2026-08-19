import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import siteConfig from "@/config/site";
import { getModuleStates, isEnabled } from "@/lib/plan";
import { getTestimonials } from "@/lib/testimonials";
import { getOrders } from "@/lib/orders";
import { getPendingClosureRequests, getPendingPasswordResets } from "@/lib/members";
import { getWaitlist } from "@/lib/bookingWaitlist";

export const dynamic = "force-dynamic";

// Pulls every scattered "needs a human" queue this admin panel has grown into one glance,
// each only counted (and shown) when its module is actually part of this deployment's plan —
// checking a disabled module's table would either 404 the query against a fresh install or
// just be noise for a feature this client doesn't have.
async function getAttentionItems() {
  const items = [];
  const moduleStates = await getModuleStates();

  if (isEnabled("reviews", moduleStates)) {
    const testimonials = await getTestimonials();
    const pending = testimonials.filter((t) => t.status === "Pending").length;
    if (pending > 0) {
      items.push({
        count: pending,
        label: pending === 1 ? "review to moderate" : "reviews to moderate",
        href: "/admin/testimonials",
      });
    }
  }

  if (isEnabled("cart", moduleStates)) {
    const orders = await getOrders();
    const pending = orders.filter((o) => o.status === "Pending").length;
    if (pending > 0) {
      items.push({
        count: pending,
        label: pending === 1 ? "order awaiting confirmation" : "orders awaiting confirmation",
        href: "/admin/orders",
      });
    }
  }

  if (isEnabled("booking", moduleStates)) {
    const waitlist = await getWaitlist();
    if (waitlist.length > 0) {
      items.push({
        count: waitlist.length,
        label: waitlist.length === 1 ? "person on the booking waitlist" : "people on the booking waitlist",
        href: "/admin/booking-waitlist",
      });
    }
  }

  if (isEnabled("members", moduleStates)) {
    const [closures, resets] = await Promise.all([
      getPendingClosureRequests(),
      getPendingPasswordResets(),
    ]);
    if (closures.length > 0) {
      items.push({
        count: closures.length,
        label: closures.length === 1 ? "account closure request" : "account closure requests",
        href: "/admin/account-closures",
      });
    }
    if (resets.length > 0) {
      items.push({
        count: resets.length,
        label: resets.length === 1 ? "password reset request" : "password reset requests",
        href: "/admin/member-resets",
      });
    }
  }

  return items;
}

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
  const [session, enquiryCount, dbConnected, visitCount, attentionItems] = await Promise.all([
    getServerSession(authOptions),
    getEnquiryCount(),
    getDbStatus(),
    getVisitsThisMonth(),
    getAttentionItems(),
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

      <div className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Needs attention</h2>
        {attentionItems.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            All caught up — nothing waiting on you right now.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {attentionItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-surface-alt"
              >
                <span className="text-foreground">{item.label}</span>
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {item.count}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
