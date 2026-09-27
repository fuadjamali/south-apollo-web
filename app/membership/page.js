"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import { useBusinessName } from "@/components/BusinessNameContext";
import { useT } from "@/components/LocaleContext";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

const STATUS_STYLE = {
  Active: "text-green-600 dark:text-green-400",
  Expired: "text-yellow-600 dark:text-yellow-400",
  Suspended: "text-red-600 dark:text-red-400",
  Closed: "text-gray-500 dark:text-gray-400",
};

export default function MembershipPage() {
  const businessName = useBusinessName();
  const t = useT();
  const [lastName, setLastName] = useState("");
  const [postcode, setPostcode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/verify-membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastName, postcode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(res.status === 400 ? t("membership.fieldsRequired") : t("common.genericError"));
        return;
      }

      setResult(data);
    } catch {
      setError(t("common.genericError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 whitespace-nowrap text-xl font-bold">
            <Logo className="h-7 w-7" />
            {businessName}
          </a>
          <a href="/" className="text-sm font-medium hover:text-muted">
            &larr; {t("common.backToHome")}
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-center text-3xl font-bold">{t("membership.title")}</h1>
        <p className="mt-2 text-center text-muted">
          {t("membership.intro")}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">{t("membership.lastName")}</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">{t("membership.postcode")}</label>
            <input
              type="text"
              required
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className={fieldClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            {loading ? t("membership.checking") : t("membership.check")}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {result && (
          <div className="mt-6 rounded-xl border border-border p-6 text-center">
            {result.found ? (
              <>
                <p className="text-sm text-muted">
                  {result.firstName} {result.lastName} &middot; {result.memberId}
                </p>
                <p className={`mt-2 text-2xl font-bold ${STATUS_STYLE[result.status] || ""}`}>
                  {t(`membership.status.${result.status}`)}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">
                {t("membership.notFound")}
              </p>
            )}
          </div>
        )}

        <p className="mt-10 text-center text-sm text-muted">
          {t("membership.manageOnline")}{" "}
          <a href="/member/login" className="font-medium text-accent hover:underline">
            {t("membership.logIn")}
          </a>{" "}
          {t("membership.or")}{" "}
          <a href="/member/signup" className="font-medium text-accent hover:underline">
            {t("membership.createAccount")}
          </a>
          {t("membership.sentenceEnd")}
        </p>
      </main>
    </div>
  );
}
