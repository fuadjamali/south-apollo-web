import { logoutAction } from "@/app/member/actions";
import { getT } from "@/lib/i18n/server";

export default async function MemberSignOutButton() {
  const { t } = await getT();
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-alt"
      >
        {t("member.signOut")}
      </button>
    </form>
  );
}
