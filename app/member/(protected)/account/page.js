import { getMemberSession } from "@/lib/memberSession";
import { getMember } from "@/lib/members";
import MemberChangePasswordForm from "@/components/MemberChangePasswordForm";
import AccountClosureForm from "@/components/AccountClosureForm";
import { getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/translate";

export const dynamic = "force-dynamic";

export default async function MemberAccountPage() {
  const [session, { locale, t }] = await Promise.all([getMemberSession(), getT()]);
  const member = await getMember(session.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("member.myAccount")}</h1>
            <p className="mt-1 text-sm text-muted">
              {t("member.signedInAs", { name: session?.name, email: session?.email })}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/member/orders"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              {t("member.myOrders")}
            </a>
            <a
              href="/member/bookings"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              {t("member.myBookings")}
            </a>
          </div>
        </div>

        <MemberChangePasswordForm />

        <div className="mt-8 border-t border-border pt-6">
          <p className="text-sm font-semibold text-foreground">{t("member.closeTitle")}</p>
          {member?.closure_requested_at ? (
            <p className="mt-2 text-sm text-muted">
              {t("member.closeRequested", {
                date: formatDate(member.closure_requested_at, locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              })}
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted">
                {t("member.closeExplain")}
              </p>
              <AccountClosureForm />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
