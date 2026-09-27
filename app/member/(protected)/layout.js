import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/memberSession";
import { getMember } from "@/lib/members";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import MemberSignOutButton from "@/components/MemberSignOutButton";
import { getBusinessInfo } from "@/lib/businessInfo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getT } from "@/lib/i18n/server";

export default async function MemberProtectedLayout({ children }) {
  const session = await getMemberSession();
  if (!session) {
    redirect("/member/login");
  }

  // The signed cookie only proves who they were when they logged in, not that the account is
  // still open — an admin may have closed it (GDPR anonymization) since. Checking live status
  // here, not just at login, is what actually revokes access for an already-issued session.
  // Deliberately just redirects rather than clearing the cookie — a Server Component can't
  // modify cookies (only Server Actions/Route Handlers can); the stale cookie is harmless
  // since this same check blocks it again on every subsequent request.
  const member = await getMember(session.id);
  if (!member || member.membership_status === "Closed") {
    redirect("/member/login");
  }
  const [business, { t }] = await Promise.all([getBusinessInfo(), getT()]);

  return (
    <div className="flex min-h-screen flex-col bg-surface-alt">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 whitespace-nowrap text-lg font-bold text-foreground">
            <Logo className="h-6 w-6" />
            {business.name} <span className="font-normal text-muted">{t("member.badge")}</span>
          </span>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-alt sm:inline-block"
            >
              {t("member.viewSite")}
            </a>
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <ThemeToggle className="hidden sm:inline-block" />
            <MemberSignOutButton />
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">{children}</main>
    </div>
  );
}
