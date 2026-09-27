import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import MemberResetPasswordForm from "@/components/MemberResetPasswordForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getT } from "@/lib/i18n/server";

export default async function MemberResetPasswordPage({ searchParams }) {
  const [params, { t }] = await Promise.all([searchParams, getT()]);
  const token = params?.token?.toString() || "";

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="fixed right-6 top-6 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
          <Logo className="mx-auto h-10 w-10 text-foreground" />
          <h1 className="mt-3 text-center text-xl font-bold text-foreground">{t("member.resetTitle")}</h1>
          <p className="mt-1 text-center text-sm text-muted">{t("member.resetIntro")}</p>

          {token ? (
            <MemberResetPasswordForm token={token} />
          ) : (
            <p className="mt-6 rounded-lg border border-border bg-surface-alt p-4 text-sm text-red-600 dark:text-red-400">
              {t("member.resetMissingToken")}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
