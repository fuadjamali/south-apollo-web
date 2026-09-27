"use client";

import { useActionState } from "react";
import { useT } from "@/components/LocaleContext";
import { signupAction } from "@/app/member/actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function MemberSignupForm() {
  const t = useT();
  const [state, formAction, pending] = useActionState(signupAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground">{t("member.firstName")}</label>
          <input type="text" name="firstName" required className={fieldClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">{t("membership.lastName")}</label>
          <input type="text" name="lastName" required className={fieldClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">{t("enquiry.email")}</label>
        <input type="email" name="email" required className={fieldClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">{t("member.password")}</label>
        <input type="password" name="password" required minLength={8} className={fieldClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">{t("member.confirmPassword")}</label>
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
        disabled={pending}
        className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {pending ? t("member.creatingAccount") : t("member.createAccountButton")}
      </button>
    </form>
  );
}
