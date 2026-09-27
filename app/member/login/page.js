import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import MemberLoginForm from "@/components/MemberLoginForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getT } from "@/lib/i18n/server";

export default async function MemberLoginPage({ searchParams }) {
  const [params, { t }] = await Promise.all([searchParams, getT()]);
  const redirectTo = params?.redirect?.toString() || "";

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="fixed right-6 top-6 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
          <Logo className="mx-auto h-10 w-10 text-foreground" />
          <h1 className="mt-3 text-center text-xl font-bold text-foreground">{t("member.loginTitle")}</h1>
          <p className="mt-1 text-center text-sm text-muted">{t("member.loginIntro")}</p>

          <MemberLoginForm redirectTo={redirectTo} />

          <div className="mt-4 flex items-center justify-between text-sm">
            <a href="/member/signup" className="font-medium text-accent hover:underline">
              {t("member.createAccount")}
            </a>
            <a href="/member/forgot-password" className="text-muted hover:underline">
              {t("member.forgotLink")}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
