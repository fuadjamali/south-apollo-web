import { logoutAction } from "@/app/member/actions";

export default function MemberSignOutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-alt"
      >
        Sign out
      </button>
    </form>
  );
}
