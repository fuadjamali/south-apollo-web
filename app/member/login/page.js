import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import ColorThemeSwitcher from "@/components/ColorThemeSwitcher";
import MemberLoginForm from "@/components/MemberLoginForm";

export default async function MemberLoginPage({ searchParams }) {
  const params = await searchParams;
  const redirectTo = params?.redirect?.toString() || "";

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="fixed right-6 top-6 flex items-center gap-2">
        <ColorThemeSwitcher />
        <ThemeToggle />
      </div>

      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
          <Logo className="mx-auto h-10 w-10 text-foreground" />
          <h1 className="mt-3 text-center text-xl font-bold text-foreground">Member login</h1>
          <p className="mt-1 text-center text-sm text-muted">Sign in to manage your account.</p>

          <MemberLoginForm redirectTo={redirectTo} />

          <div className="mt-4 flex items-center justify-between text-sm">
            <a href="/member/signup" className="font-medium text-accent hover:underline">
              Create an account
            </a>
            <a href="/member/forgot-password" className="text-muted hover:underline">
              Forgot password?
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
