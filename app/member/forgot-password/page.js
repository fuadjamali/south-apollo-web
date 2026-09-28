import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import MemberForgotPasswordForm from "@/components/MemberForgotPasswordForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getT } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const { t } = await getT();
  // Private account page — titled and described for the browser tab and link previews, but
  // kept out of search results (robots.txt also disallows /member).
  return buildPageMetadata({
    title: t("member.forgotTitle"),
    description: t("member.forgotIntro"),
    path: "/member/forgot-password",
    noIndex: true,
  });
}

export default async function MemberForgotPasswordPage() {
  const { t } = await getT();
  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="fixed right-6 top-6 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
          <Logo className="mx-auto h-10 w-10 text-foreground" />
          <h1 className="mt-3 text-center text-xl font-bold text-foreground">{t("member.forgotTitle")}</h1>
          <p className="mt-1 text-center text-sm text-muted">
            {t("member.forgotIntro")}
          </p>

          <MemberForgotPasswordForm />

          <p className="mt-4 text-center text-sm text-muted">
            <a href="/member/login" className="font-medium text-accent hover:underline">
              {t("member.backToLogin")}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
