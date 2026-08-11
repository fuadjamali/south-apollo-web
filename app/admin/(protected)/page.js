import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import siteConfig from "@/config/site";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
      <h1 className="text-xl font-bold text-foreground">
        {siteConfig.admin.dashboardHeading}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {siteConfig.admin.dashboardSubheading}
      </p>
      <p className="mt-4 text-sm text-foreground">{session?.user?.email}</p>
    </div>
  );
}
