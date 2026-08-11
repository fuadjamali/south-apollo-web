import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import siteConfig from "@/config/site";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center shadow-sm">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        {siteConfig.admin.dashboardHeading}
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {siteConfig.admin.dashboardSubheading}
      </p>
      <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">{session?.user?.email}</p>
    </div>
  );
}
