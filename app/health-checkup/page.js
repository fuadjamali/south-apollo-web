import {
  IconCircleCheck,
  IconMicroscope,
  IconStethoscope,
  IconBolt,
  IconHeartHandshake,
  IconPhone,
  IconDeviceMobile,
} from "@tabler/icons-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getT } from "@/lib/i18n/server";
import { getSiteHeaderProps } from "@/lib/siteHeader";
import { isModuleEnabled } from "@/lib/plan";
import { buildPageMetadata } from "@/lib/seo";
import {
  getActivePackages,
  getHealthCheckupPage,
  splitLines,
  discountPercent,
} from "@/lib/healthPackages";

export async function generateMetadata() {
  const [{ t }, page] = await Promise.all([getT(), getHealthCheckupPage()]);
  return buildPageMetadata({
    title: t("packages.pageTitle"),
    description: page.intro || page.heading,
    path: "/health-checkup",
  });
}

const WHY_ICONS = [IconMicroscope, IconStethoscope, IconBolt, IconHeartHandshake];

// "Title: description" per line → { title, text }; a line without a colon is all title.
function parseWhyItems(text) {
  return splitLines(text).map((line) => {
    const colon = line.indexOf(":");
    return colon === -1
      ? { title: line, text: "" }
      : { title: line.slice(0, colon).trim(), text: line.slice(colon + 1).trim() };
  });
}

function telHref(number) {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}

export default async function HealthCheckupPage() {
  const { locale, t } = await getT();
  const [headerProps, packages, page, bookingEnabled] = await Promise.all([
    getSiteHeaderProps(locale),
    getActivePackages(),
    getHealthCheckupPage(),
    isModuleEnabled("booking"),
  ]);

  // Whole taka, grouped with commas, digits always Latin (client requirement).
  const price = (amount) => t("packages.price", { amount: amount.toLocaleString("en-US") });
  const whyItems = parseWhyItems(page.why_items);
  const mobiles = (page.mobiles || "")
    .split(",")
    .map((number) => number.trim())
    .filter(Boolean);

  const bookButton = (className) =>
    bookingEnabled ? (
      <a
        href="/booking"
        className={`rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-accent-foreground hover:brightness-90 ${className}`}
      >
        {t("packages.book")}
      </a>
    ) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader {...headerProps} />

      <main>
        {/* Intro */}
        <section className="border-b border-border bg-surface-alt">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            {page.eyebrow && (
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">
                {page.eyebrow}
              </p>
            )}
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{page.heading}</h1>
            {page.intro && <p className="mx-auto mt-4 max-w-2xl text-muted">{page.intro}</p>}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {bookButton("")}
              {page.hotline && (
                <a
                  href={telHref(page.hotline)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold hover:bg-background"
                >
                  <IconPhone size={16} />
                  {t("packages.callHotline", { number: page.hotline })}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          {packages.length === 0 ? (
            <p className="text-center text-muted">{t("packages.empty")}</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => {
                const tests = splitLines(pkg.tests);
                const percent = discountPercent(pkg);
                return (
                  <article
                    key={pkg.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
                  >
                    {pkg.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        className="aspect-video w-full border-b border-border object-cover"
                      />
                    )}
                    <div className="border-b border-border p-6">
                      <h2 className="text-xl font-bold">{pkg.name}</h2>
                      {pkg.description && (
                        <p className="mt-2 text-sm text-muted">{pkg.description}</p>
                      )}

                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div>
                          {percent !== null && (
                            <p className="text-sm text-muted">
                              {t("packages.previousPrice")}{" "}
                              <s className="whitespace-nowrap">{price(pkg.previous_price)}</s>
                            </p>
                          )}
                          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
                            {t(percent !== null ? "packages.discountedPrice" : "packages.packagePrice")}
                          </p>
                          <p className="whitespace-nowrap text-3xl font-extrabold text-primary">
                            {price(pkg.price)}
                          </p>
                        </div>
                        {percent !== null && (
                          <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-foreground">
                            {t("packages.save", { percent })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 p-6">
                      <p className="text-sm font-semibold">
                        {t("packages.includedTests", { count: tests.length })}
                      </p>
                      <ul className="mt-3 space-y-2 text-sm">
                        {tests.map((test) => (
                          <li key={test} className="flex gap-2">
                            <IconCircleCheck size={18} className="mt-px shrink-0 text-primary" />
                            <span>{test}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {bookingEnabled && (
                      <div className="border-t border-border p-6">{bookButton("block w-full")}</div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Health awareness */}
        {(page.awareness_body || page.quote) && (
          <section className="bg-surface-alt py-16">
            <div className="mx-auto max-w-3xl px-6">
              {page.awareness_heading && (
                <h2 className="text-center text-3xl font-bold">{page.awareness_heading}</h2>
              )}
              {page.awareness_body && (
                <p className="mt-4 whitespace-pre-line text-center text-muted">
                  {page.awareness_body}
                </p>
              )}
              {page.quote && (
                <blockquote className="mt-8 rounded-xl border-l-4 border-accent bg-surface p-6 text-lg font-semibold italic text-foreground shadow-sm">
                  {page.quote}
                </blockquote>
              )}
            </div>
          </section>
        )}

        {/* Why choose us */}
        {whyItems.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16">
            {page.why_heading && (
              <h2 className="text-center text-3xl font-bold">{page.why_heading}</h2>
            )}
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {whyItems.map((item, index) => {
                const Icon = WHY_ICONS[index % WHY_ICONS.length];
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border bg-surface p-6 text-center shadow-sm"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Icon size={26} stroke={1.75} />
                    </div>
                    <h3 className="mt-4 font-semibold">{item.title}</h3>
                    {item.text && <p className="mt-1 text-sm text-muted">{item.text}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Appointment contacts */}
        {(page.hotline || mobiles.length > 0) && (
          <section className="bg-surface-alt py-16">
            <div className="mx-auto max-w-2xl px-6 text-center">
              {page.contact_heading && <h2 className="text-3xl font-bold">{page.contact_heading}</h2>}
              {page.contact_intro && <p className="mt-2 text-muted">{page.contact_intro}</p>}
              <div className="mt-8 space-y-4">
                {page.hotline && (
                  <p className="flex flex-wrap items-center justify-center gap-2">
                    <IconPhone size={20} className="text-primary" />
                    <span className="font-semibold">{t("packages.hotline")}:</span>
                    <a href={telHref(page.hotline)} className="text-lg font-bold hover:underline">
                      {page.hotline}
                    </a>
                  </p>
                )}
                {mobiles.length > 0 && (
                  <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                    <IconDeviceMobile size={20} className="text-primary" />
                    <span className="font-semibold">{t("packages.mobile")}:</span>
                    {mobiles.map((number) => (
                      <a key={number} href={telHref(number)} className="font-medium hover:underline">
                        {number}
                      </a>
                    ))}
                  </p>
                )}
              </div>
              {bookButton("mt-8 inline-block")}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
