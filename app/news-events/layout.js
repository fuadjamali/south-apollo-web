import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getContentMaxWClass } from "@/lib/homeLayout";
import { getLocale } from "@/lib/i18n/server";
import { getSiteHeaderProps } from "@/lib/siteHeader";

export default async function NewsEventsLayout({ children }) {
  const locale = await getLocale();
  const [contentMaxW, headerProps] = await Promise.all([
    getContentMaxWClass("max-w-4xl"),
    getSiteHeaderProps(locale),
  ]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader {...headerProps} />

      <main className={`mx-auto ${contentMaxW} px-6 py-16`}>{children}</main>

      <SiteFooter />
    </div>
  );
}
