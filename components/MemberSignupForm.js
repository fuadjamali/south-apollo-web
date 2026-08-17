"use client";

import { useActionState } from "react";
import { signupAction } from "@/app/member/actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function MemberSignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground">First name</label>
          <input type="text" name="firstName" required className={fieldClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Last name</label>
          <input type="text" name="lastName" required className={fieldClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Email</label>
        <input type="email" name="email" required className={fieldClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Password</label>
        <input type="password" name="password" required minLength={8} className={fieldClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Confirm password</label>
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
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
