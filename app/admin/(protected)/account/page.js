import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AccountForm from "./AccountForm";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Account settings</h1>
        <p className="mt-1 text-sm text-muted">Signed in as {session?.user?.email}</p>

        <AccountForm />
      </div>
    </div>
  );
}
