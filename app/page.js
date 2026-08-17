import { IconMapPin, IconPhone, IconMail } from "@tabler/icons-react";
import SiteHeader from "@/components/SiteHeader";
import EnquiryForm from "@/components/EnquiryForm";
import VisitTracker from "@/components/VisitTracker";
import CookieConsent from "@/components/CookieConsent";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import BackToTopButton from "@/components/BackToTopButton";
import SocialLinks from "@/components/SocialLinks";
import CategoryFilter from "@/components/CategoryFilter";
import Logo from "@/components/Logo";
import siteConfig from "@/config/site";
import { buildLocalBusinessJsonLd } from "@/lib/structuredData";
import { getProducts, getProductCategories } from "@/lib/products";
import { getContactInfo } from "@/lib/contactInfo";
import { getReviews } from "@/lib/reviews";
import { getApprovedTestimonials, getTestimonialStats } from "@/lib/testimonials";
import { getAboutInfo } from "@/lib/aboutInfo";
import { getRecentPosts } from "@/lib/blog";
import { getActiveTeamsWithMembers } from "@/lib/teamMembers";
import { getActivePartners } from "@/lib/partners";
import { getRecentItems } from "@/lib/newsEvents";
import { getStats } from "@/lib/stats";
import { getSteps } from "@/lib/howItWorks";
import { getRecentPhotos } from "@/lib/gallery";
import { getPortfolioItems } from "@/lib/portfolio";
import { getCertifications } from "@/lib/certifications";
import { getEffectiveSiteConfig, isModuleEnabled, isPublicPathEnabled } from "@/lib/plan";

// ISR: cached for up to an hour, but /admin/products' Server Actions call revalidatePath("/")
// on every create/update/delete, so admin edits actually show up immediately — this window is
// just a safety net, not the primary way updates propagate.
export const revalidate = 3600;

export const metadata = {
  title: `${siteConfig.business.name} — ${siteConfig.business.tagline}`,
  description: siteConfig.business.description,
  openGraph: {
    type: "website",
    title: `${siteConfig.business.name} — ${siteConfig.business.tagline}`,
    description: siteConfig.business.description,
    images: ["/og-image.svg"],
    url: `https://${siteConfig.business.domain}`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.business.name} — ${siteConfig.business.tagline}`,
    description: siteConfig.business.description,
    images: ["/og-image.svg"],
  },
};

export default async function Home({ searchParams }) {
  // Sections belonging to a module outside this deployment's plan are forced to null here,
  // so every `{section && (...)}` check below "just works" without any further plan checks.
  const effectiveConfig = getEffectiveSiteConfig(siteConfig);
  const {
    hero,
    stats,
    partners,
    howItWorks,
    products,
    portfolio,
    gallery,
    reviews,
    team,
    certifications,
    map,
    enquiryForm,
    footer,
    business,
    contact,
  } = effectiveConfig;

  const cartEnabled = isModuleEnabled("cart");
  const membersEnabled = isModuleEnabled("members");
  const themesEnabled = isModuleEnabled("themes");
  // Drops any nav item (or child of a group) whose module isn't in this deployment's plan,
  // and drops a group entirely if every one of its children got filtered out — same pattern
  // as the admin nav's filterNav in app/admin/(protected)/layout.js.
  const filteredNav = siteConfig.nav
    .map((item) => {
      if (!item.children) return item;
      const children = item.children.filter((child) => isPublicPathEnabled(child.href));
      return children.length > 0 ? { ...item, children } : null;
    })
    .filter((item) => item && (item.children || isPublicPathEnabled(item.href)));

  const params = await searchParams;
  const selectedCategory = params?.category || "";

  const [
    productItems,
    productCategories,
    contactInfo,
    reviewItems,
    testimonials,
    testimonialStats,
    aboutInfo,
    recentPosts,
    teamGroups,
    partnerItems,
    recentNewsEvents,
    statItems,
    howItWorksSteps,
    recentPhotos,
    portfolioItems,
    certificationItems,
  ] = await Promise.all([
    getProducts({ category: selectedCategory || undefined }),
    getProductCategories(),
    getContactInfo(),
    getReviews(),
    reviews ? getApprovedTestimonials(6) : Promise.resolve([]),
    reviews ? getTestimonialStats() : Promise.resolve({ count: 0, average: 0 }),
    getAboutInfo(),
    effectiveConfig.blog ? getRecentPosts(3) : Promise.resolve([]),
    getActiveTeamsWithMembers(),
    getActivePartners(),
    effectiveConfig.newsEvents ? getRecentItems(3) : Promise.resolve([]),
    stats ? getStats() : Promise.resolve([]),
    howItWorks ? getSteps() : Promise.resolve([]),
    gallery ? getRecentPhotos(3) : Promise.resolve([]),
    portfolio ? getPortfolioItems() : Promise.resolve([]),
    certifications ? getCertifications() : Promise.resolve([]),
  ]);

  const footerWhatsappHref = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(footer.whatsappMessage || contact.whatsappMessage)}`;
  const jsonLd = buildLocalBusinessJsonLd(siteConfig);

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
        cartEnabled={cartEnabled}
        membersEnabled={membersEnabled}
        themesEnabled={themesEnabled}
      />

      <main>
      {/* COMPONENT: hero (required) */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          {hero.heading}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          {hero.subheading}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href={hero.primaryCta.href}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            {hero.primaryCta.label}
          </a>
          <a
            href={hero.secondaryCta.href}
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-surface-alt"
          >
            {hero.secondaryCta.label}
          </a>
        </div>
      </section>

      {/* COMPONENT: stats (optional — live from Postgres, editable at /admin/stats) */}
      {stats && statItems.length > 0 && (
        <section className="border-y border-border py-10">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 text-center sm:grid-cols-4">
            {statItems.map((stat) => (
              <div key={stat.id}>
                <p className="text-3xl font-extrabold">{stat.value}</p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* COMPONENT: trusted-by (optional — live from Postgres, editable at /admin/partners;
          only status "Active" partners shown) */}
      {partners && partnerItems.length > 0 && (
        <section className="border-b border-border bg-surface-alt py-12">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <p className="text-sm font-medium text-muted">{partners.heading}</p>
            <div className="mt-8 grid grid-cols-2 items-center gap-8 sm:grid-cols-3 md:grid-cols-5">
              {partnerItems.map((partner) =>
                partner.logo ? (
                  // Admin-editable image source — plain <img>, same reasoning as
                  // products/blog/reviews.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={partner.id}
                    src={partner.logo}
                    alt={partner.name}
                    title={partner.name}
                    className="mx-auto h-8 w-24 object-contain opacity-70"
                  />
                ) : (
                  <div
                    key={partner.id}
                    className="mx-auto h-8 w-24 rounded bg-gray-200 dark:bg-gray-700 opacity-70"
                    title={partner.name}
                  />
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* COMPONENT: how-it-works (optional — live from Postgres, editable at /admin/how-it-works) */}
      {howItWorks && howItWorksSteps.length > 0 && (
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold">{howItWorks.heading}</h2>
          <p className="mt-2 text-center text-muted">{howItWorks.subheading}</p>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {howItWorksSteps.map((step, index) => (
              <div key={step.id} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* COMPONENT: products (core — live from Postgres, editable at /admin/products) */}
      <section id="products" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold">{products.heading}</h2>
        <p className="mt-2 text-muted">{products.subheading}</p>

        {productCategories.length > 0 && (
          <div className="mt-6">
            <CategoryFilter categories={productCategories} selected={selectedCategory} />
          </div>
        )}

        {productItems.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted">No products in this category.</p>
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

      {/* COMPONENT: portfolio (optional — live from Postgres, editable at /admin/portfolio) */}
      {portfolio && portfolioItems.length > 0 && (
        <section id="portfolio" className="bg-surface-alt py-20">
          <div className="mx-auto max-w-6xl px-6">
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

      {/* COMPONENT: gallery (optional — live from Postgres, editable at /admin/gallery; the 3
          most recent photos show here, the full set lives at /gallery) */}
      {gallery && recentPhotos.length > 0 && (
        <section id="gallery" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold">{gallery.heading}</h2>
          <p className="mt-2 text-muted">{gallery.subheading}</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {recentPhotos.map((photo) => (
              <figure
                key={photo.id}
                className="overflow-hidden rounded-xl border border-border shadow-sm"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.image}
                    alt={photo.caption || ""}
                    className="h-full w-full object-cover"
                  />
                </div>
                {photo.caption && (
                  <figcaption className="p-3 text-sm text-muted">{photo.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href="/gallery"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-surface-alt"
            >
              View full gallery
            </a>
          </div>
        </section>
      )}

      {/* COMPONENT: reviews (optional — live from Postgres, editable at /admin/reviews) */}
      {reviews && reviewItems.length > 0 && (
        <section id="reviews" className="mx-auto max-w-6xl px-6 py-20">
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
      {reviews && (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          {testimonialStats.count > 0 && (
            <p className="mb-6 text-center text-sm text-muted">
              <span className="font-semibold text-foreground">
                {testimonialStats.average.toFixed(1)} / 5
              </span>{" "}
              average from {testimonialStats.count} customer review
              {testimonialStats.count === 1 ? "" : "s"}
            </p>
          )}
          {testimonials.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.id} className="rounded-xl border border-border p-6">
                  <p className="text-yellow-500" aria-label={`${t.rating} out of 5 stars`}>
                    {"★".repeat(t.rating)}
                    <span className="text-gray-300 dark:text-gray-600">
                      {"★".repeat(5 - t.rating)}
                    </span>
                  </p>
                  <p className="mt-3 text-sm text-foreground">&ldquo;{t.body}&rdquo;</p>
                  <p className="mt-4 text-sm font-semibold text-muted">— {t.author_name}</p>
                </div>
              ))}
            </div>
          )}
          <p className="mt-8 text-center">
            <a href="/leave-a-review" className="text-sm font-medium text-accent hover:underline">
              Leave us a review &rarr;
            </a>
          </p>
        </section>
      )}

      {/* COMPONENT: recent-posts (optional — latest 3 blog posts, only shown if Blog is enabled) */}
      {effectiveConfig.blog && recentPosts.length > 0 && (
        <section id="recent-posts" className="bg-surface-alt py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl font-bold">{effectiveConfig.blog.heading}</h2>
            <p className="mt-2 text-muted">{effectiveConfig.blog.subheading}</p>

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
                      {new Date(post.published_date).toLocaleDateString(undefined, {
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
                View all posts
              </a>
            </div>
          </div>
        </section>
      )}

      {/* COMPONENT: news-events (optional — latest 3 news/event items, live from Postgres,
          editable at /admin/news-events) */}
      {effectiveConfig.newsEvents && recentNewsEvents.length > 0 && (
        <section id="news-events" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl font-bold">{effectiveConfig.newsEvents.heading}</h2>
            <p className="mt-2 text-muted">{effectiveConfig.newsEvents.subheading}</p>

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
                        {item.type}
                      </span>
                      <span>
                        {new Date(item.published_date).toLocaleDateString(undefined, {
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
                View all news &amp; events
              </a>
            </div>
          </div>
        </section>
      )}

      {/* COMPONENT: about (core — live from Postgres, editable at /admin/about) */}
      <section id="about" className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">{aboutInfo.heading}</h2>
        <p className="mt-4 text-muted">{aboutInfo.body}</p>
      </section>

      {/* COMPONENT: team (optional — live from Postgres, editable at /admin/team and
          /admin/team-members; only active members from teams/members with "Show on home"
          enabled are shown here, grouped by team — the full roster lives at /team) */}
      {team && teamGroups.length > 0 && (
        <section id="team" className="bg-surface-alt py-20">
          <div className="mx-auto max-w-6xl px-6">
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
                      <div
                        key={member.id}
                        className="rounded-xl border border-border bg-background p-4"
                      >
                        {member.photo && (
                          <img
                            src={member.photo}
                            alt=""
                            className="mb-3 h-16 w-16 rounded-full object-cover"
                          />
                        )}
                        <p className="font-semibold text-foreground">{member.name}</p>
                        {member.title && (
                          <p className="mt-1 text-sm text-muted">{member.title}</p>
                        )}
                      </div>
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
                View full team
              </a>
            </div>
          </div>
        </section>
      )}

      {/* COMPONENT: certifications (optional — live from Postgres, editable at
          /admin/certifications) */}
      {certifications && certificationItems.length > 0 && (
        <section id="certifications" className="bg-surface-alt py-16">
          <div className="mx-auto max-w-6xl px-6 text-center">
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

      {/* COMPONENT: map (optional — live-queries Google Maps with business.address) */}
      {map && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold">{map.heading}</h2>
          <p className="mt-2 text-center text-muted">{business.address}</p>
          <div className="mt-10 aspect-16/6 w-full overflow-hidden rounded-xl border border-border">
            <iframe
              title="Business location map"
              className="h-full w-full grayscale"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(business.address)}&output=embed`}
            />
          </div>
        </section>
      )}

      {/* COMPONENT: contact-info (optional — admin-editable at /admin/contact, singleton with an enable/disable toggle) */}
      {contactInfo?.enabled && (
        <section id="contact-info" className="bg-surface-alt py-20">
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
      {enquiryForm && (
        <section id="enquiry" className="bg-surface-alt py-20">
          <div className="mx-auto max-w-xl px-6">
            <h2 className="text-center text-3xl font-bold">{enquiryForm.heading}</h2>
            <p className="mt-2 text-center text-muted">{enquiryForm.subheading}</p>

            <EnquiryForm />
          </div>
        </section>
      )}

      {/* COMPONENT: contact-footer (required). min-h + flex centering ensures this last
          section has enough room below it to scroll fully under the sticky header when
          jumped to via #contact — otherwise, being the final element on the page, the
          browser can't scroll far enough and the Enquiry section above it stays in view. */}
      <footer
        id="contact"
        className="flex min-h-[calc(100vh-88px)] flex-col items-center justify-center bg-gray-900 dark:bg-black py-16 text-center text-white"
      >
        <h2 className="text-2xl font-bold">{footer.heading}</h2>
        <p className="mt-2 text-gray-300">{footer.subheading}</p>
        <a
          href={footerWhatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-200"
        >
          Chat on WhatsApp
        </a>

        {/* COMPONENT: social-links (optional) */}
        <SocialLinks />

        <p className="mt-10 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Logo className="h-4 w-4" />© {new Date().getFullYear()} {business.name}. All rights reserved.
        </p>
      </footer>
      </main>

      {/* COMPONENT: floating-whatsapp-button (optional) */}
      <FloatingWhatsApp />

      {/* Back-to-top button — stacked above the WhatsApp button, appears after scrolling down. */}
      <BackToTopButton />

      {/* COMPONENT: cookie-consent (required if analytics tracking is enabled) */}
      <CookieConsent />
    </div>
  );
}
