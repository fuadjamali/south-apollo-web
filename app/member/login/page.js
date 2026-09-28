import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import MemberLoginForm from "@/components/MemberLoginForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getT } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo";


export async function generateMetadata() {
  const { t } = await getT();
  // Private account page — titled and described for the browser tab and link previews, but
  // kept out of search results (robots.txt also disallows /member).
  return buildPageMetadata({
    title: t("member.loginTitle"),
    description: t("member.loginIntro"),
    path: "/member/login",
    noIndex: true,
  });
}

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
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-md sm:p-10">
          <Logo className="mx-auto h-20 w-auto max-w-[260px] text-foreground" />
          <h1 className="mt-5 text-center text-2xl font-bold text-foreground">{t("member.loginTitle")}</h1>
          <p className="mt-1 text-center text-base text-muted">{t("member.loginIntro")}</p>

          <MemberLoginForm redirectTo={redirectTo} />

          <div className="mt-5 flex items-center justify-between text-sm">
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
