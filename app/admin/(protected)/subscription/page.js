import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAdminByEmail } from "@/lib/admins";
import { PLAN } from "@/lib/plan";
import MobileNumberForm from "@/components/MobileNumberForm";
import { getBusinessInfo } from "@/lib/businessInfo";

export const dynamic = "force-dynamic";

const PLAN_BADGE = {
  basic: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  plus: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  premium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400",
};

export default async function AdminSubscriptionPage() {
  const [session, business] = await Promise.all([getServerSession(authOptions), getBusinessInfo()]);
  const admin = session?.user?.email ? await getAdminByEmail(session.user.email) : null;
  const planLabel = PLAN.charAt(0).toUpperCase() + PLAN.slice(1);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Subscription</h1>
        <p className="mt-1 text-sm text-muted">Your plan and account details.</p>

        <div className="mt-6 space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Current plan
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${PLAN_BADGE[PLAN] || PLAN_BADGE.premium}`}
              >
                {planLabel} plan
              </span>
              <a
                href="/admin/subscription/compare"
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                Compare plans
              </a>
            </div>
            <p className="mt-1 text-xs text-muted">
              To change plans, contact us — this is set per deployment, not self-serve.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Business name
            </p>
            <p className="mt-1 text-sm text-foreground">
              {business.name}{" "}
              <a href="/admin/business" className="text-xs font-medium text-accent hover:underline">
                Edit
              </a>
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Email</p>
            <p className="mt-1 text-sm text-foreground">{session?.user?.email}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Mobile number
            </p>
            <MobileNumberForm mobileNo={admin?.mobile_no} />
          </div>
        </div>
      </div>
    </div>
  );
}
