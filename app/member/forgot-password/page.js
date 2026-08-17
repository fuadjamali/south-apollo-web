import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import ColorThemeSwitcher from "@/components/ColorThemeSwitcher";
import MemberForgotPasswordForm from "@/components/MemberForgotPasswordForm";

export default function MemberForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="fixed right-6 top-6 flex items-center gap-2">
        <ColorThemeSwitcher />
        <ThemeToggle />
      </div>

      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
          <Logo className="mx-auto h-10 w-10 text-foreground" />
          <h1 className="mt-3 text-center text-xl font-bold text-foreground">Forgot password</h1>
          <p className="mt-1 text-center text-sm text-muted">
            Enter your email and an admin will send you a reset link.
          </p>

          <MemberForgotPasswordForm />

          <p className="mt-4 text-center text-sm text-muted">
            <a href="/member/login" className="font-medium text-accent hover:underline">
              Back to login
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
