"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import ColorThemeSwitcher from "@/components/ColorThemeSwitcher";

export default function AdminLoginForm({ businessName, heading, subheading }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="fixed right-6 top-6 flex items-center gap-2">
        <ColorThemeSwitcher />
        <ThemeToggle />
      </div>

      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-md sm:p-10">
          <Logo className="mx-auto h-20 w-auto max-w-[260px] text-foreground" />
          {businessName && (
            <p className="mt-2 text-center text-sm font-semibold text-foreground">
              {businessName}
            </p>
          )}
          <h1 className="mt-5 text-center text-2xl font-bold text-foreground">{heading}</h1>
          <p className="mt-1 text-center text-base text-muted">{subheading}</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-3 text-base font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
