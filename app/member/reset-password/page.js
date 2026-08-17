import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import ColorThemeSwitcher from "@/components/ColorThemeSwitcher";
import MemberResetPasswordForm from "@/components/MemberResetPasswordForm";

export default async function MemberResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  const token = params?.token?.toString() || "";

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="fixed right-6 top-6 flex items-center gap-2">
        <ColorThemeSwitcher />
        <ThemeToggle />
      </div>

      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
          <Logo className="mx-auto h-10 w-10 text-foreground" />
          <h1 className="mt-3 text-center text-xl font-bold text-foreground">Reset password</h1>
          <p className="mt-1 text-center text-sm text-muted">Choose a new password below.</p>

          {token ? (
            <MemberResetPasswordForm token={token} />
          ) : (
            <p className="mt-6 rounded-lg border border-border bg-surface-alt p-4 text-sm text-red-600 dark:text-red-400">
              This reset link is missing its token. Ask an admin for a fresh link.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
