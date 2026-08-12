import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import EnquiryForm from "@/components/EnquiryForm";
import VisitTracker from "@/components/VisitTracker";
import CookieConsent from "@/components/CookieConsent";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import SocialLinks from "@/components/SocialLinks";
import Logo from "@/components/Logo";
import siteConfig from "@/config/site";
import { buildLocalBusinessJsonLd } from "@/lib/structuredData";
import { getProducts } from "@/lib/products";

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

export default async function Home() {
  const {
    hero,
    stats,
    trustedBy,
    howItWorks,
    products,
    portfolio,
    reviews,
    about,
    certifications,
    map,
    enquiryForm,
    footer,
    business,
    contact,
  } = siteConfig;

  const productItems = await getProducts();
  const whatsappHref = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(contact.whatsappMessage)}`;
  const jsonLd = buildLocalBusinessJsonLd(siteConfig);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VisitTracker />

      {/* COMPONENT: header-nav (required) */}
      <SiteHeader />

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

      {/* COMPONENT: stats (optional) */}
      {stats && (
        <section className="border-y border-border py-10">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 text-center sm:grid-cols-4">
            {stats.items.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-extrabold">{stat.value}</p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* COMPONENT: trusted-by (optional) */}
      {trustedBy && (
        <section className="border-b border-border bg-surface-alt py-12">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <p className="text-sm font-medium text-muted">{trustedBy.heading}</p>
            <div className="mt-8 grid grid-cols-2 items-center gap-8 sm:grid-cols-3 md:grid-cols-5">
              {trustedBy.logos.map((logo) => (
                <div
                  key={logo.id}
                  className="mx-auto h-8 w-24 rounded bg-gray-200 dark:bg-gray-700 opacity-70"
                  title={logo.name}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMPONENT: how-it-works (optional) */}
      {howItWorks && (
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold">{howItWorks.heading}</h2>
          <p className="mt-2 text-center text-muted">{howItWorks.subheading}</p>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {howItWorks.steps.map((step, index) => (
              <div key={step.title} className="text-center">
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

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {productItems.map((product) => (
            <div
              key={product.id}
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
            </div>
          ))}
        </div>
      </section>

      {/* COMPONENT: portfolio (optional) */}
      {portfolio && (
        <section id="portfolio" className="bg-surface-alt py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl font-bold">{portfolio.heading}</h2>
            <p className="mt-2 text-muted">{portfolio.subheading}</p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {portfolio.items.map((item) => (
                <div key={item.id} className="relative aspect-square overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800">
                  <Image
                    src={item.image}
                    alt={`Portfolio project ${item.id}`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMPONENT: reviews (optional) */}
      {reviews && (
        <section id="reviews" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold">{reviews.heading}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {reviews.platforms.map((platform) => (
              <a
                key={platform.id}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center rounded-xl border border-border p-6 text-center transition hover:shadow-md"
              >
                {platform.logo ? (
                  <Image src={platform.logo} alt={platform.name} width={96} height={32} className="h-8 w-auto" />
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

      {/* COMPONENT: about (core) */}
      <section id="about" className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">{about.heading}</h2>
        <p className="mt-4 text-muted">{about.body}</p>
      </section>

      {/* COMPONENT: certifications (optional) */}
      {certifications && (
        <section className="bg-surface-alt py-16">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <p className="text-sm font-medium text-muted">{certifications.heading}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-10">
              {certifications.items.map((cert) => (
                <div
                  key={cert.id}
                  className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-800"
                  title={cert.name}
                />
              ))}
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

      {/* COMPONENT: contact-footer (required) */}
      <footer id="contact" className="bg-gray-900 dark:bg-black py-16 text-center text-white">
        <h2 className="text-2xl font-bold">{footer.heading}</h2>
        <p className="mt-2 text-gray-300">{footer.subheading}</p>
        <a
          href={whatsappHref}
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

      {/* COMPONENT: cookie-consent (required if analytics tracking is enabled) */}
      <CookieConsent />
    </div>
  );
}
