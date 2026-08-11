"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-alt"
    >
      Sign out
    </button>
  );
}
