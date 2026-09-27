"use client";

import { useActionState } from "react";
import { useT } from "@/components/LocaleContext";
import { resetPasswordAction } from "@/app/member/actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function MemberResetPasswordForm({ token }) {
  const t = useT();
  const [state, formAction, pending] = useActionState(resetPasswordAction, {});

  if (state?.success) {
    return (
      <div className="mt-6 space-y-4">
        <p className="rounded-lg border border-border bg-surface-alt p-4 text-sm text-foreground">
          {state.success}
        </p>
        <a
          href="/member/login"
          className="block w-full rounded-lg bg-primary py-2 text-center text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          {t("member.goToLogin")}
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label className="block text-sm font-medium text-foreground">{t("member.newPassword")}</label>
        <input type="password" name="password" required minLength={8} className={fieldClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">{t("member.confirmNewPassword")}</label>
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          className={fieldClass}
        />
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || !token}
        className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {pending ? t("member.resetting") : t("member.resetTitle")}
      </button>
    </form>
  );
}
