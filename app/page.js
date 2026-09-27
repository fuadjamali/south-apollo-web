import {
  IconMapPin,
  IconPhone,
  IconMail,
  IconCalendarEvent,
  IconSpeakerphone,
  IconArticle,
  IconStar,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import { HOW_IT_WORKS_ICONS } from "@/lib/howItWorksIcons";
import SiteHeader from "@/components/SiteHeader";
import EnquiryForm from "@/components/EnquiryForm";
import VisitTracker from "@/components/VisitTracker";
import CookieConsent from "@/components/CookieConsent";
import SiteFooter from "@/components/SiteFooter";
import CategoryFilter from "@/components/CategoryFilter";
import ImageTextSection from "@/components/ImageTextSection";
import MemberCard from "@/components/MemberCard";
import siteConfig from "@/config/site";
import { buildLocalBusinessJsonLd } from "@/lib/structuredData";
import { getProducts, getProductCategories } from "@/lib/products";
import { getContactInfo } from "@/lib/contactInfo";
import { getSocialSettings, getWhatsappHref } from "@/lib/socialSettings";
import { getBusinessInfo } from "@/lib/businessInfo";
import { getActiveHeroSlides, getHeroSettings } from "@/lib/heroSlides";
import HeroCarousel from "@/components/HeroCarousel";
import { getSectionHeadings } from "@/lib/sectionHeadings";
import { getNavTree } from "@/lib/navItems";
import { getSiteText } from "@/lib/siteText";
import { getReviews } from "@/lib/reviews";
import { getApprovedTestimonials, getTestimonialStats } from "@/lib/testimonials";
import { getAboutInfo } from "@/lib/aboutInfo";
import { getVisionMissionInfo } from "@/lib/visionMissionInfo";
import { getHistoryInfo } from "@/lib/historyInfo";
import { getRecentPosts } from "@/lib/blog";
import { getActiveTeamsWithMembers } from "@/lib/teamMembers";
import { getActivePartners } from "@/lib/partners";
import { getRecentItems } from "@/lib/newsEvents";
import { getStats } from "@/lib/stats";
import { getSteps } from "@/lib/howItWorks";
import { getRecentPhotos } from "@/lib/gallery";
import GalleryMarquee from "@/components/GalleryMarquee";
import { getPortfolioItems } from "@/lib/portfolio";
import { getCertifications } from "@/lib/certifications";
import { getModuleStates, isEnabled } from "@/lib/plan";
import { getHomeLayout } from "@/lib/homeLayout";
import { TIERS } from "@/lib/planFeatures";
import { buildPageMetadata } from "@/lib/seo";
import { buildSiteNav } from "@/lib/siteHeader";
import { getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/translate";
import { getActiveDoctors, getSpecialties } from "@/lib/doctors";
import { getActivePackages } from "@/lib/healthPackages";
import HomeDoctorsSection from "@/components/HomeDoctorsSection";
import HomeHealthPackagesSection from "@/components/HomeHealthPackagesSection";

// ISR: cached for up to an hour, but /admin/products' Server Actions call revalidatePath("/")
// on every create/update/delete, so admin edits actually show up immediately — this window is
// just a safety net, not the primary way updates propagate.
export const revalidate = 3600;

export async function generateMetadata() {
  const business = await getBusinessInfo();
  const title = `${business.name} — ${business.tagline}`;
  return buildPageMetadata({
    title,
    description: business.description,
    path: "/",
    titleAbsolute: true,
  });
}

export default async function Home({ searchParams }) {
  // Sections belonging to a module outside this deployment's plan (or switched off via Feature
  // Config) are forced to null here, so every `{section && (...)}` check below "just works"
  // without any further plan checks.
  // contactInfo is fetched here (not in the big Promise.all below, where it used to live)
  // because filteredNav needs its `enabled` flag — that section's on/off state lives on the
  // contact_info row itself (lib/contactInfo.js), not in module_settings like every other
  // Feature Config toggle, so it can't go through moduleStates/isPublicPathEnabled.
  const { locale, t } = await getT();
  const [
    moduleStates,
    contactInfo,
    socialSettings,
    business,
    heroSlides,
    heroSettings,
    sectionHeadings,
    navTree,
    siteText,
    homeLayout,
  ] = await Promise.all([
    getModuleStates(),
    getContactInfo(locale),
    getSocialSettings(),
    getBusinessInfo(),
    getActiveHeroSlides(locale),
    getHeroSettings(),
    getSectionHeadings(locale),
    getNavTree(locale),
    getSiteText(locale),
    getHomeLayout(),
  ]);
  const { plans } = siteConfig;
  const {
    howItWorks,
    portfolio,
    gallery,
    reviews,
    certifications,
    team,
    blog,
    newsEvents,
    enquiryForm,
    map,
    products,
    partners,
    doctors: doctorsHeading,
    healthPackages: healthPackagesHeading,
  } = sectionHeadings;

  const cartEnabled = isEnabled("cart", moduleStates);
  const membersEnabled = isEnabled("members", moduleStates);
  const themesEnabled = isEnabled("themes", moduleStates);
  const footerEnabled = isEnabled("footer", moduleStates);
  const productsEnabled = isEnabled("products", moduleStates);
  const statsEnabled = isEnabled("stats", moduleStates);
  const partnersEnabled = isEnabled("partners", moduleStates);
  // Home Page Layout (Settings → Home Page Layout, lib/homeLayout.js): a CSS `order` per
  // section rather than actually rearranging the JSX below — every section stays exactly where
  // it already was in the file, in Default order; a Custom layout just gives each one a
  // different `order` value via this map, and <main> below is a column flexbox so `order` is
  // what actually decides visual position. Deliberately not real DOM reordering: with ~18
  // sections each carrying nontrivial markup, moving the JSX itself would have meant a much
  // larger, much riskier rewrite for the same visual result. The trade-off is real and worth
  // knowing: assistive tech and keyboard tab order follow DOM order, not this CSS order, so a
  // heavily reordered Custom layout can read/tab in a different sequence than it displays.
  // Hero and Footer are never in this map — they get hardcoded order values below instead,
  // -1 and 999, so they always stay first/last regardless of what's in a custom order.
  const sectionOrder = Object.fromEntries(homeLayout.sectionOrder.map((key, i) => [key, i]));
  // Sidebar Layout (the third Home Page Layout preset): whichever section the admin picked as
  // homeLayout.asideContent (News & Events, Blog, or Reviews) moves out of the ordered
  // main-column flow above and into an aside next to it — already-feed-shaped content is the
  // natural fit for a narrow column (a grid of product cards or the pricing table wouldn't read
  // well squeezed into one). Only meaningful, and only takes a grid column, when that section is
  // actually enabled and has items — otherwise there's nothing to put beside the main column, so
  // it renders as a single column same as Default.
  const isSidebarLayout = homeLayout.layoutName === "sidebar";
  const isFillWidth = homeLayout.contentWidth === "fill";
  // Fill (Home Page Layout → Fill browser width) is common to all three layouts. "Contained"
  // (off) is every section's existing max-w-6xl, pixel-identical to how the page has always
  // rendered — this toggle is additive, never a silent change to the current default look.
  // "Fill" swaps that to max-w-none so the same sections stretch edge to edge on a wide monitor.
  // Deliberately NOT applied to sections with their own narrower reading-width choice regardless
  // of Fill — Contact Info and Send an Enquiry (a form/short info block, not a grid, has no
  // business spanning 1900px) and the text-only fallback inside ImageTextSection.js (About/
  // Vision/History with no image — a paragraph of body text, same reasoning).
  const sectionMaxW = isFillWidth ? "max-w-none" : "max-w-6xl";
  const filteredNav = buildSiteNav(navTree, { moduleStates, contactInfo, onHomePage: true });

  const params = await searchParams;
  const selectedCategory = params?.category || "";

  const [
    productItems,
    productCategories,
    reviewItems,
    testimonials,
    testimonialStats,
    aboutInfo,
    visionMissionInfo,
    historyInfo,
    recentPosts,
    teamGroups,
    partnerItems,
    recentNewsEvents,
    statItems,
    howItWorksSteps,
    recentPhotos,
    portfolioItems,
    certificationItems,
    homeDoctors,
    doctorSpecialties,
    healthPackageItems,
  ] = await Promise.all([
    getProducts({ category: selectedCategory || undefined }),
    getProductCategories(),
    getReviews(),
    isEnabled("reviews", moduleStates) ? getApprovedTestimonials(6) : Promise.resolve([]),
    isEnabled("reviews", moduleStates)
      ? getTestimonialStats()
      : Promise.resolve({ count: 0, average: 0 }),
    getAboutInfo(locale),
    isEnabled("visionMission", moduleStates) ? getVisionMissionInfo(locale) : Promise.resolve(null),
    isEnabled("history", moduleStates) ? getHistoryInfo(locale) : Promise.resolve(null),
    isEnabled("blog", moduleStates) ? getRecentPosts(3) : Promise.resolve([]),
    getActiveTeamsWithMembers(),
    getActivePartners(),
    isEnabled("newsEvents", moduleStates) ? getRecentItems(3) : Promise.resolve([]),
    statsEnabled ? getStats() : Promise.resolve([]),
    isEnabled("howItWorks", moduleStates) ? getSteps() : Promise.resolve([]),
    isEnabled("gallery", moduleStates) ? getRecentPhotos(6) : Promise.resolve([]),
    isEnabled("portfolio", moduleStates) ? getPortfolioItems() : Promise.resolve([]),
    isEnabled("certifications", moduleStates) ? getCertifications() : Promise.resolve([]),
    isEnabled("doctors", moduleStates) ? getActiveDoctors() : Promise.resolve([]),
    isEnabled("doctors", moduleStates) ? getSpecialties() : Promise.resolve([]),
    isEnabled("healthPackages", moduleStates) ? getActivePackages() : Promise.resolve([]),
  ]);

  const footerWhatsappHref = getWhatsappHref(
    socialSettings,
    socialSettings.footer_whatsapp_message || socialSettings.whatsapp_message
  );

  // Sidebar Layout's aside content — one of three already-feed-shaped sections, admin's choice
  // (homeLayout.asideContent). Each has its own item shape (dated + typed for News & Events,
  // dated for Blog, rated + quoted for Reviews), so this builds one normalized `asideItems` list
  // (icon, date badge or rating, title/quote, optional link) the JSX below can render generically,
  // rather than three near-duplicate card layouts.
  const ASIDE_SOURCES = {
    newsEvents: {
      heading: newsEvents.heading,
      enabled: isEnabled("newsEvents", moduleStates) && recentNewsEvents.length > 0,
      viewAllHref: "/news-events",
      viewAllLabel: t("home.viewAllNewsEvents"),
      items: recentNewsEvents.map((item) => ({
        key: item.slug,
        href: `/news-events/${item.slug}`,
        date: item.published_date,
        badge: t(`newsEvents.type.${item.type}`),
        icon: item.type === "Event" ? "event" : "news",
        title: item.title,
      })),
    },
    blog: {
      heading: blog.heading,
      enabled: isEnabled("blog", moduleStates) && recentPosts.length > 0,
      viewAllHref: "/blog",
      viewAllLabel: t("home.viewAllPosts"),
      items: recentPosts.map((post) => ({
        key: post.slug,
        href: `/blog/${post.slug}`,
        date: post.published_date,
        badge: null,
        icon: "article",
        title: post.title,
      })),
    },
    reviews: {
      heading: reviews.heading,
      enabled: isEnabled("reviews", moduleStates) && testimonials.length > 0,
      viewAllHref: "/leave-a-review",
      viewAllLabel: t("home.leaveReview"),
      items: testimonials.map((testimonial) => ({
        key: testimonial.id,
        href: null,
        rating: testimonial.rating,
        quote: testimonial.body,
        author: testimonial.author_name,
        icon: "star",
      })),
    },
  };
  // homeLayout.asideContent is a checkbox multi-select now, not a single choice — one stacked
  // card per selected-and-enabled source, always in this fixed order (not selection order,
  // for predictability) regardless of which order the admin ticked the boxes in.
  const activeAsideList = ["newsEvents", "blog", "reviews"]
    .filter((key) => homeLayout.asideContent?.includes(key))
    .map((key) => ({ key, ...ASIDE_SOURCES[key] }))
    .filter((source) => source.enabled);
  const showAside = isSidebarLayout && activeAsideList.length > 0;
  const asideTypeIcon = { event: IconCalendarEvent, news: IconSpeakerphone, article: IconArticle };

  // Built once, placed on whichever side homeLayout.asidePosition picks below — a plain JS
  // variable holding JSX is safe to reference in two mutually-exclusive branches like this,
  // since only one of them ever actually renders it. `sticky` sits on the outer stack (not each
  // card) so multiple cards scroll together as one unit. Ends with a single shared WhatsApp
  // quick-chat CTA (same link the footer's own button uses) below every card, rather than one
  // per card, so the sidebar earns its space on every page view without repeating itself.
  const asideNode = showAside && (
    <aside className="w-full">
      <div className="sticky top-24 space-y-4">
        {activeAsideList.map((source) => (
          <div
            key={source.key}
            className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
          >
            <div className="border-b border-border bg-surface-alt px-5 py-4">
              <h2 className="text-lg font-bold text-foreground">{source.heading}</h2>
            </div>
            <ul className="divide-y divide-border">
              {source.items.map((item) => {
                const Content =
                  item.icon === "star" ? (
                    <div className="flex gap-3 px-5 py-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <IconStar size={18} className="fill-current" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-foreground">&ldquo;{item.quote}&rdquo;</p>
                        <p className="mt-1 text-xs font-medium text-muted">— {item.author}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 px-5 py-4">
                      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="text-[10px] font-bold uppercase leading-none">
                          {formatDate(item.date, locale, { month: "short" })}
                        </span>
                        <span className="text-base font-bold leading-none">
                          {new Date(item.date).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        {item.badge && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
                            {(() => {
                              const Icon = asideTypeIcon[item.icon];
                              return Icon ? <Icon size={12} /> : null;
                            })()}
                            {item.badge}
                          </span>
                        )}
                        <p className="mt-0.5 truncate text-sm font-semibold text-foreground group-hover:text-accent">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  );
                return (
                  <li key={item.key} className="group">
                    {item.href ? (
                      <a href={item.href} className="block hover:bg-surface-alt">
                        {Content}
                      </a>
                    ) : (
                      Content
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-border p-4">
              <a
                href={source.viewAllHref}
                className="block rounded-lg border border-border py-2 text-center text-sm font-medium text-foreground hover:bg-surface-alt"
              >
                {source.viewAllLabel} &rarr;
              </a>
            </div>
          </div>
        ))}
        {footerWhatsappHref && (
          <a
            href={footerWhatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <IconBrandWhatsapp size={16} />
            {t("common.chatOnWhatsapp")}
          </a>
        )}
      </div>
    </aside>
  );
  const jsonLd = buildLocalBusinessJsonLd({ business, address: contactInfo.address, siteConfig });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VisitTracker />

      {/* COMPONENT: header-nav (required) */}
      <SiteHeader
        nav={filteredNav}
        businessName={business.name}
        cartEnabled={cartEnabled}
        membersEnabled={membersEnabled}
        themesEnabled={themesEnabled}
        footerEnabled={footerEnabled}
      />

      <main className="flex flex-col">
      {/* COMPONENT: hero (optional — toggled from Settings → Feature Config; content itself
          lives in Postgres, editable at /admin/hero). One slide = no carousel chrome, behaves
          exactly like the original single hero; two or more play as a sliding carousel — see
          components/HeroCarousel.js. */}
      {isEnabled("hero", moduleStates) && heroSlides.length > 0 && (
        <HeroCarousel slides={heroSlides} sectionMaxW={sectionMaxW} heightPx={heroSettings?.height_px} />
      )}

      {/* Sidebar Layout's grid wrapper — everything from Stats through Send an Enquiry lives
          inside this one flex item (order: 0, between Hero at -1 and Footer at 999). When the
          aside isn't showing, both this and the inner div below render as `display: contents` —
          invisible to layout, so their children behave exactly as if they were direct children
          of <main>'s own flex column, identical to Default/Custom. Only when the aside actually
          renders does this become a real 2-column grid; grid column order follows JSX order
          (aside first for "left", main first for "right"), so no extra CSS ordering is needed
          beyond picking which side matches the grid-template-columns below. Fill (isFillWidth)
          only affects this outer wrapper's own width/padding — individual sections inside the
          main column keep their own max-w-6xl centering regardless, so body text never actually
          runs edge-to-edge even when the sidebar area itself does. */}
      <div
        style={{ order: 0 }}
        className={
          showAside
            ? `grid w-full gap-x-10 ${
                isFillWidth ? "" : "mx-auto max-w-[1980px] px-6"
              } ${
                homeLayout.asidePosition === "left"
                  ? "lg:grid-cols-[280px_1fr]"
                  : "lg:grid-cols-[1fr_280px]"
              }`
            : "contents"
        }
      >
      {homeLayout.asidePosition === "left" && asideNode}

      <div className={showAside ? "flex min-w-0 flex-col" : "contents"}>

      {/* COMPONENT: stats (optional — live from Postgres, editable at /admin/stats) */}
      {statsEnabled && statItems.length > 0 && (
        <section className="border-y border-border py-10" style={{ order: sectionOrder.stats }}>
          <div className={`mx-auto grid ${sectionMaxW} grid-cols-2 gap-8 px-6 text-center sm:grid-cols-4`}>
            {statItems.map((stat) => (
              <div key={stat.id}>
                <p className="text-3xl font-extrabold">{stat.value}</p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* COMPONENT: doctors (optional — a teaser for the Find a Doctor page: search box, common
          problems and a few doctors; the directory itself lives at /doctors) */}
      {isEnabled("doctors", moduleStates) && homeDoctors.length > 0 && (
        <HomeDoctorsSection
          heading={doctorsHeading?.heading}
          subheading={doctorsHeading?.subheading}
          doctors={homeDoctors}
          departmentCount={doctorSpecialties.filter((s) => s.doctor_count > 0).length}
          locale={locale}
          t={t}
          sectionMaxW={sectionMaxW}
          style={{ order: sectionOrder.doctors }}
        />
      )}

      {/* COMPONENT: health-packages (optional — package cards linking to /health-checkup) */}
      {isEnabled("healthPackages", moduleStates) && healthPackageItems.length > 0 && (
        <HomeHealthPackagesSection
          heading={healthPackagesHeading?.heading}
          subheading={healthPackagesHeading?.subheading}
          packages={healthPackageItems}
          t={t}
          sectionMaxW={sectionMaxW}
          style={{ order: sectionOrder.healthPackages }}
        />
      )}

      {/* COMPONENT: trusted-by (optional — live from Postgres, editable at /admin/partners;
          only status "Active" partners shown) */}
      {partnersEnabled && partnerItems.length > 0 && (
        <section
          className="border-b border-border bg-surface-alt py-12"
          style={{ order: sectionOrder.trustedBy }}
        >
          <div className={`mx-auto ${sectionMaxW} px-6 text-center`}>
            <p className="text-sm font-medium text-muted">{partners.heading}</p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {partnerItems.map((partner) => {
                // Conditional element type, not always an <a> disabled by CSS — a no-link card
                // never renders an inert href-less link (bad for keyboard/screen-reader users,
                // who'd tab into a link that goes nowhere), and there's no second near-duplicate
                // card component needed for the "not clickable" case.
                const CardTag = partner.link_url ? "a" : "div";
                const cardProps = partner.link_url
                  ? {
                      href: partner.link_url,
                      ...(partner.link_url.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {}),
                    }
                  : {};
                return (
                  <CardTag
                    key={partner.id}
                    {...cardProps}
                    title={partner.description || partner.name}
                    className={`flex h-24 items-center justify-center rounded-xl border border-border bg-surface p-4 shadow-sm transition hover:shadow-md ${
                      partner.link_url ? "hover:border-primary focus-visible:border-primary" : ""
                    }`}
                  >
                    {partner.logo ? (
                      // Admin-editable image source — plain <img>, same reasoning as
                      // products/blog/reviews.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="max-h-10 w-full object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
                      />
                    ) : (
                      <span className="text-sm font-medium text-muted">{partner.name}</span>
                    )}
                  </CardTag>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* COMPONENT: how-it-works (optional — live from Postgres, editable at /admin/how-it-works) */}
      {isEnabled("howItWorks", moduleStates) && howItWorksSteps.length > 0 && (
        <section
          id="how-it-works"
          className={`mx-auto ${sectionMaxW} px-6 py-20`}
          style={{ order: sectionOrder.howItWorks }}
        >
          <h2 className="text-center text-3xl font-bold">{howItWorks.heading}</h2>
          <p className="mt-2 text-center text-muted">{howItWorks.subheading}</p>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {howItWorksSteps.map((step, index) => {
              const StepIcon = HOW_IT_WORKS_ICONS[step.icon]?.Icon;
              return (
                <div
                  key={step.id}
                  className="rounded-xl border border-border bg-surface p-6 text-center shadow-sm"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {StepIcon ? (
                      <StepIcon size={26} stroke={1.75} />
                    ) : (
                      <span className="text-lg font-bold">{index + 1}</span>
                    )}
                  </div>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted">{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* COMPONENT: products (optional — toggled from Settings → Feature Config; content
          itself lives in Postgres, editable at /admin/products) */}
      {productsEnabled && (
      <section
        id="products"
        className={`mx-auto ${sectionMaxW} px-6 py-20`}
        style={{ order: sectionOrder.products }}
      >
        <h2 className="text-3xl font-bold">{products.heading}</h2>
        <p className="mt-2 text-muted">{products.subheading}</p>

        {productCategories.length > 0 && (
          <div className="mt-6">
            <CategoryFilter categories={productCategories} selected={selectedCategory} />
          </div>
        )}

        {productItems.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted">{t("home.noProductsInCategory")}</p>
        ) : (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {productItems.map((product) => (
              <a
                key={product.id}
                href={`/products/${product.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="overflow-hidden rounded-xl border border-border shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {product.image && (
                    // Admin-editable image source (path or arbitrary external URL) — a plain
                    // <img> avoids next/image's hostname allowlist, which would hard-crash the
                    // page for any URL from a domain not preconfigured in next.config.mjs.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="mt-1 text-sm text-muted">{product.description}</p>
                  <p className="mt-3 font-bold">{product.price}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
      )}

      {/* COMPONENT: plans (optional — static, not admin-editable. Only meaningful for South
          Apollo's own marketing site; a deployed client site has no reason to show its own
          Basic/Plus/Premium tiers to its visitors, so this should be `null` in config/site.js
          for every client deployment — see lib/planFeatures.js for the shared tier data. */}
      {plans && (
        <section
          id="plans"
          className="bg-surface-alt py-20"
          style={{ order: sectionOrder.plans }}
        >
          <div className={`mx-auto ${sectionMaxW} px-6`}>
            <h2 className="text-center text-3xl font-bold">{plans.heading}</h2>
            <p className="mt-2 text-center text-muted">{plans.subheading}</p>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {TIERS.map((tier) => (
                <div
                  key={tier.key}
                  className={`relative rounded-2xl border p-8 ${
                    tier.popular
                      ? "border-primary shadow-lg"
                      : "border-border shadow-sm"
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold">{tier.label}</h3>
                  <p className="mt-1 text-sm text-muted">{tier.blurb}</p>

                  <div className="mt-5">
                    <p className="text-3xl font-extrabold">
                      {tier.setupPrice}
                      <span className="text-sm font-normal text-muted"> setup</span>
                    </p>
                    <p className="text-sm text-muted">{tier.monthlyPrice} / month</p>
                  </div>

                  <ul className="mt-6 space-y-2 text-sm">
                    {tier.highlights.map((item) =>
                      item.endsWith(":") ? (
                        <li key={item} className="pt-1 font-semibold text-foreground">
                          {item}
                        </li>
                      ) : (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-0.5 text-green-600 dark:text-green-400">
                            &#10003;
                          </span>
                          <span className="text-foreground">{item}</span>
                        </li>
                      )
                    )}
                  </ul>

                  <a
                    href={
                      isEnabled("enquiryForm", moduleStates)
                        ? "#enquiry"
                        : contactInfo.enabled
                          ? "#contact-info"
                          : "#plans"
                    }
                    className={`mt-8 block rounded-full py-3 text-center text-sm font-semibold ${
                      tier.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                        : "border border-border text-foreground hover:bg-surface-alt"
                    }`}
                  >
                    Get my free quote
                  </a>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center">
              <a
                href="/compare-plans"
                className="text-sm font-medium text-accent hover:underline"
              >
                Explore full features comparison &rarr;
              </a>
            </p>
          </div>
        </section>
      )}

      {/* COMPONENT: portfolio (optional — live from Postgres, editable at /admin/portfolio) */}
      {isEnabled("portfolio", moduleStates) && portfolioItems.length > 0 && (
        <section
          id="portfolio"
          className="bg-surface-alt py-20"
          style={{ order: sectionOrder.portfolio }}
        >
          <div className={`mx-auto ${sectionMaxW} px-6`}>
            <h2 className="text-3xl font-bold">{portfolio.heading}</h2>
            <p className="mt-2 text-muted">{portfolio.subheading}</p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {portfolioItems.map((item) => (
                <figure
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-border shadow-sm"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-200 dark:bg-gray-800">
                    {/* Admin-editable image source (Blob URL or local path) — plain <img>
                        avoids next/image's hostname allowlist. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name || ""}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {item.name && (
                    <figcaption className="p-3 text-sm font-medium text-foreground">
                      {item.name}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMPONENT: gallery (optional — live from Postgres, editable at /admin/gallery; the 6
          most recent photos auto-advance here, the full masonry gallery lives at /gallery) */}
      {isEnabled("gallery", moduleStates) && recentPhotos.length > 0 && (
        <section
          id="gallery"
          className={`mx-auto ${sectionMaxW} px-6 py-20`}
          style={{ order: sectionOrder.gallery }}
        >
          <h2 className="text-3xl font-bold">{gallery.heading}</h2>
          <p className="mt-2 text-muted">{gallery.subheading}</p>

          <div className="mt-10">
            <GalleryMarquee photos={recentPhotos} />
          </div>

          <div className="mt-10 text-center">
            <a
              href="/gallery"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-surface-alt"
            >
              {t("home.viewFullGallery")}
            </a>
          </div>
        </section>
      )}

      {/* COMPONENT: reviews (optional — live from Postgres, editable at /admin/reviews). Both
          this and the testimonials block below it are skipped here together when Sidebar Layout
          has Reviews feeding the aside instead — same "reviews" section/order value covers both,
          so they move (or don't) as one unit, same as they always have. */}
      {!(isSidebarLayout && homeLayout.asideContent?.includes("reviews")) &&
        isEnabled("reviews", moduleStates) &&
        reviewItems.length > 0 && (
        <section
          id="reviews"
          className={`mx-auto ${sectionMaxW} px-6 py-20`}
          style={{ order: sectionOrder.reviews }}
        >
          <h2 className="text-center text-3xl font-bold">{reviews.heading}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {reviewItems.map((platform) => (
              <a
                key={platform.id}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center rounded-xl border border-border p-6 text-center transition hover:shadow-md"
              >
                {platform.logo ? (
                  // Admin-editable image source — plain <img>, same reasoning as products/blog.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={platform.logo} alt={platform.name} className="h-8 w-auto" />
                ) : (
                  <div className="h-8 w-24 rounded bg-gray-200 dark:bg-gray-800" title={platform.name} />
                )}
                <p className="mt-4 text-2xl font-bold">{platform.rating} / 5</p>
                <p className="mt-1 text-sm text-muted">
                  {platform.name} &middot; {platform.count}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* COMPONENT: testimonials (optional — customer-submitted, admin-moderated; shown
          alongside third-party ratings when Reviews is enabled) */}
      {!(isSidebarLayout && homeLayout.asideContent?.includes("reviews")) &&
        isEnabled("reviews", moduleStates) && (
        <section
          className={`mx-auto ${sectionMaxW} px-6 pb-20`}
          style={{ order: sectionOrder.reviews }}
        >
          {testimonialStats.count > 0 && (
            <p className="mb-6 text-center text-sm text-muted">
              <span className="font-semibold text-foreground">
                {testimonialStats.average.toFixed(1)} / 5
              </span>{" "}
              {t(testimonialStats.count === 1 ? "home.reviewAverageOne" : "home.reviewAverageMany", {
                count: testimonialStats.count,
              })}
            </p>
          )}
          {testimonials.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="rounded-xl border border-border p-6">
                  <p
                    className="text-yellow-500"
                    aria-label={t("home.starsLabel", { rating: testimonial.rating })}
                  >
                    {"★".repeat(testimonial.rating)}
                    <span className="text-gray-300 dark:text-gray-600">
                      {"★".repeat(5 - testimonial.rating)}
                    </span>
                  </p>
                  <p className="mt-3 text-sm text-foreground">&ldquo;{testimonial.body}&rdquo;</p>
                  <p className="mt-4 text-sm font-semibold text-muted">— {testimonial.author_name}</p>
                </div>
              ))}
            </div>
          )}
          <p className="mt-8 text-center">
            <a href="/leave-a-review" className="text-sm font-medium text-accent hover:underline">
              {t("home.leaveReview")} &rarr;
            </a>
          </p>
        </section>
      )}

      {/* COMPONENT: recent-posts (optional — latest 3 blog posts, only shown if Blog is enabled).
          Skipped here when Sidebar Layout has Blog feeding the aside instead. */}
      {!(isSidebarLayout && homeLayout.asideContent?.includes("blog")) &&
        isEnabled("blog", moduleStates) &&
        recentPosts.length > 0 && (
        <section
          id="recent-posts"
          className="bg-surface-alt py-20"
          style={{ order: sectionOrder.blog }}
        >
          <div className={`mx-auto ${sectionMaxW} px-6`}>
            <h2 className="text-3xl font-bold">{blog.heading}</h2>
            <p className="mt-2 text-muted">{blog.subheading}</p>

            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {recentPosts.map((post) => (
                <a
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="overflow-hidden rounded-xl border border-border bg-background shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {post.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-muted">
                      {formatDate(post.published_date, locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">{post.title}</h3>
                    <p className="mt-1 text-sm text-muted">{post.excerpt}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-10 text-center">
              <a
                href="/blog"
                className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-surface-alt"
              >
                {t("home.viewAllPosts")}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* COMPONENT: news-events (optional — latest 3 news/event items, live from Postgres,
          editable at /admin/news-events). Skipped here when Sidebar Layout has it feeding the
          aside instead (see activeAside/showAside above) — not rendered in both places at once. */}
      {!(isSidebarLayout && homeLayout.asideContent?.includes("newsEvents")) &&
        isEnabled("newsEvents", moduleStates) &&
        recentNewsEvents.length > 0 && (
        <section id="news-events" className="py-20" style={{ order: sectionOrder.newsEvents }}>
          <div className={`mx-auto ${sectionMaxW} px-6`}>
            <h2 className="text-3xl font-bold">{newsEvents.heading}</h2>
            <p className="mt-2 text-muted">{newsEvents.subheading}</p>

            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {recentNewsEvents.map((item) => (
                <a
                  key={item.slug}
                  href={`/news-events/${item.slug}`}
                  className="overflow-hidden rounded-xl border border-border shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span
                        className={`rounded-full px-2 py-0.5 font-medium ${
                          item.type === "Event"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                        }`}
                      >
                        {t(`newsEvents.type.${item.type}`)}
                      </span>
                      <span>
                        {formatDate(item.published_date, locale, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted">{item.summary}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-10 text-center">
              <a
                href="/news-events"
                className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-surface-alt"
              >
                {t("home.viewAllNewsEvents")}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* COMPONENT: about (optional — toggled from Settings → Feature Config; content itself
          lives in Postgres, editable at /admin/about). Rendering (three layouts depending on
          image_position, including the hero-style "behind the text" full-bleed background) is
          shared with vision-mission/history below via components/ImageTextSection.js — see that
          file for why each layout looks the way it does. */}
      {isEnabled("about", moduleStates) && (
        <ImageTextSection
          id="about"
          data={aboutInfo}
          sectionStyle={{ order: sectionOrder.about }}
          maxW={sectionMaxW}
          eyebrow={t("home.aboutEyebrow")}
          badge={
            homeDoctors.length > 0
              ? t("home.aboutBadge", { doctors: homeDoctors.length })
              : t("home.visionBadge")
          }
        />
      )}

      {/* COMPONENT: vision-mission (optional, off by default — toggled from Settings → Feature
          Config; content lives in Postgres, editable at /admin/vision-mission). Only renders
          once an admin has written a body — a client who switches the module on before filling
          it in gets nothing rather than an empty heading. */}
      {isEnabled("visionMission", moduleStates) && visionMissionInfo?.body && (
        <ImageTextSection
          id="vision-mission"
          data={visionMissionInfo}
          sectionStyle={{ order: sectionOrder.visionMission }}
          maxW={sectionMaxW}
          eyebrow={t("home.visionEyebrow")}
          badge={t("home.visionBadge")}
          tinted
        />
      )}

      {/* COMPONENT: history (optional, off by default — same reasoning as vision-mission
          directly above; editable at /admin/history). Same shared renderer as About/Vision &
          Mission — writing the body as two or more consecutive dated paragraphs ("August 5,
          2024: ...") is what upgrades it to a connected vertical timeline, via
          ImageTextSection.js's parseTimeline content-shape detection; anything else renders as
          a plain paragraph. */}
      {isEnabled("history", moduleStates) && historyInfo?.body && (
        <ImageTextSection
          id="history"
          eyebrow={t("home.historyEyebrow")}
          data={historyInfo}
          sectionStyle={{ order: sectionOrder.history }}
          maxW={sectionMaxW}
        />
      )}

      {/* COMPONENT: team (optional — live from Postgres, editable at /admin/team and
          /admin/team-members; only active members from teams/members with "Show on home"
          enabled are shown here, grouped by team — the full roster lives at /team) */}
      {isEnabled("team", moduleStates) && teamGroups.length > 0 && (
        <section id="team" className="bg-surface-alt py-20" style={{ order: sectionOrder.team }}>
          <div className={`mx-auto ${sectionMaxW} px-6`}>
            <h2 className="text-center text-3xl font-bold">{team.heading}</h2>
            {team.subheading && (
              <p className="mt-2 text-center text-muted">{team.subheading}</p>
            )}

            <div className="mt-10 space-y-12">
              {teamGroups.map((group) => (
                <div key={group.id}>
                  <h3 className="text-lg font-semibold text-foreground">{group.name}</h3>
                  <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {group.members.map((member) => (
                      <MemberCard key={member.id} member={member} className="bg-background" />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <a
                href="/team"
                className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-surface-alt"
              >
                {t("home.viewFullTeam")}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* COMPONENT: certifications (optional — live from Postgres, editable at
          /admin/certifications) */}
      {isEnabled("certifications", moduleStates) && certificationItems.length > 0 && (
        <section
          id="certifications"
          className="bg-surface-alt py-16"
          style={{ order: sectionOrder.certifications }}
        >
          <div className={`mx-auto ${sectionMaxW} px-6 text-center`}>
            <p className="text-sm font-medium text-muted">{certifications.heading}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-10">
              {certificationItems.map((cert) =>
                cert.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={cert.id}
                    src={cert.image}
                    alt={cert.name}
                    title={cert.name}
                    className="h-16 w-16 rounded-full border border-border object-contain p-1"
                  />
                ) : (
                  <div
                    key={cert.id}
                    className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-800"
                    title={cert.name}
                  />
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* COMPONENT: map (optional — live-queries Google Maps with contactInfo.address, the
          same admin-editable value shown in the Contact Us section below, rather than a
          second independent address that could drift out of sync with it) */}
      {isEnabled("map", moduleStates) && contactInfo.address && (
        <section
          className={`mx-auto ${sectionMaxW} px-6 py-20`}
          style={{ order: sectionOrder.map }}
        >
          <h2 className="text-center text-3xl font-bold">{map.heading}</h2>
          <p className="mt-2 text-center text-muted">{contactInfo.address}</p>
          <div className="mt-10 aspect-16/6 w-full overflow-hidden rounded-xl border border-border">
            <iframe
              title={t("home.mapTitle")}
              className="h-full w-full grayscale"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(contactInfo.address)}&output=embed`}
            />
          </div>
        </section>
      )}

      {/* COMPONENT: contact-info (optional — admin-editable at /admin/contact, singleton with an enable/disable toggle) */}
      {contactInfo?.enabled && (
        <section
          id="contact-info"
          className="bg-surface-alt py-20"
          style={{ order: sectionOrder.contactInfo }}
        >
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-3xl font-bold">{contactInfo.heading}</h2>
            {contactInfo.subheading && (
              <p className="mt-2 text-muted">{contactInfo.subheading}</p>
            )}

            <div className="mt-10 space-y-4">
              {contactInfo.address && (
                <div className="flex items-center justify-center gap-3 text-sm">
                  <IconMapPin size={20} className="shrink-0 text-muted" />
                  <span className="text-foreground">{contactInfo.address}</span>
                </div>
              )}
              {contactInfo.phone && (
                <div className="flex items-center justify-center gap-3 text-sm">
                  <IconPhone size={20} className="shrink-0 text-muted" />
                  <a href={`tel:${contactInfo.phone}`} className="text-foreground hover:underline">
                    {contactInfo.phone}
                  </a>
                </div>
              )}
              {contactInfo.email && (
                <div className="flex items-center justify-center gap-3 text-sm">
                  <IconMail size={20} className="shrink-0 text-muted" />
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-foreground hover:underline"
                  >
                    {contactInfo.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* COMPONENT: enquiry-form (optional — submits to /api/enquiries, viewable at /admin/enquiries) */}
      {isEnabled("enquiryForm", moduleStates) && (
        <section
          id="enquiry"
          className="bg-surface-alt py-20"
          style={{ order: sectionOrder.enquiryForm }}
        >
          <div className="mx-auto max-w-xl px-6">
            <h2 className="text-center text-3xl font-bold">{enquiryForm.heading}</h2>
            <p className="mt-2 text-center text-muted">{enquiryForm.subheading}</p>

            <EnquiryForm />
          </div>
        </section>
      )}

      </div>

      {homeLayout.asidePosition === "right" && asideNode}
      </div>

      {/* COMPONENT: contact-footer (optional — toggled from Settings → Feature Config; see
          components/SiteFooter.js, shared with the other public pages). */}
      <SiteFooter onHomePage />
      </main>

      {/* COMPONENT: cookie-consent (required if analytics tracking is enabled) */}
      <CookieConsent
        message={siteText.cookie_message}
        acceptLabel={siteText.cookie_accept_label}
        declineLabel={siteText.cookie_decline_label}
      />
    </div>
  );
}
