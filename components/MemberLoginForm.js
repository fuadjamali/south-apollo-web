"use client";

import { useActionState } from "react";
import { useT } from "@/components/LocaleContext";
import { loginAction } from "@/app/member/actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function MemberLoginForm({ redirectTo = "" }) {
  const t = useT();
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div>
        <label className="block text-sm font-medium text-foreground">{t("enquiry.email")}</label>
        <input type="email" name="email" required className={fieldClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">{t("member.password")}</label>
        <input type="password" name="password" required className={fieldClass} />
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {pending ? t("member.signingIn") : t("member.signIn")}
      </button>
    </form>
  );
}
