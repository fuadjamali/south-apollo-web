import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import MemberSignupForm from "@/components/MemberSignupForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getT } from "@/lib/i18n/server";

export default async function MemberSignupPage() {
  const { t } = await getT();
  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="fixed right-6 top-6 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <main className="flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
          <Logo className="mx-auto h-10 w-10 text-foreground" />
          <h1 className="mt-3 text-center text-xl font-bold text-foreground">{t("member.createAccount")}</h1>
          <p className="mt-1 text-center text-sm text-muted">
            {t("member.signupIntro")}
          </p>

          <MemberSignupForm />

          <p className="mt-4 text-center text-sm text-muted">
            {t("member.haveAccount")}{" "}
            <a href="/member/login" className="font-medium text-accent hover:underline">
              {t("membership.logIn")}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
