import { getBusinessInfo } from "@/lib/businessInfo";

// One place that assembles title + description + canonical + Open Graph + Twitter Card
// consistently, instead of every page hand-rolling its own subset (which is how canonical URLs
// and OG/Twitter images ended up missing from most of the site — see the commit this shipped in
// for the full list). `image` should be a path (site-relative, e.g. a product/post's own photo)
// or a full URL; omitted entirely, it falls back to the dynamic /opengraph-image route
// (app/opengraph-image.js) rather than the old static placeholder SVG. `noIndex` is for
// transactional/personal pages (cart, checkout, order confirmations) that should never appear in
// search results even though they're public routes.
export async function buildPageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  noIndex = false,
  titleAbsolute = false,
}) {
  const business = await getBusinessInfo();
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const url = `${baseUrl}${path}`;
  const resolvedDescription = description || business.description;
  const resolvedImage = image || "/opengraph-image";

  return {
    // `titleAbsolute` bypasses the root layout's title.template ("%s — {business.name}") — for
    // the one page (home) whose own title already spells out the business name in full, so it
    // doesn't end up duplicated ("Acme — tagline — Acme"). Every other page wants the template.
    title: titleAbsolute ? { absolute: title } : title,
    description: resolvedDescription,
    alternates: { canonical: url },
    ...(noIndex && { robots: { index: false, follow: false } }),
    openGraph: {
      type,
      title,
      description: resolvedDescription,
      url,
      images: [resolvedImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: resolvedDescription,
      images: [resolvedImage],
    },
  };
}
