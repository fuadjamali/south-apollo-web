// `business` is a business_info row (lib/businessInfo.js — name, description, ...); `address`
// is contact_info.address (lib/contactInfo.js) — the same value shown in the Contact Us
// section and the map embed, rather than a separate copy of its own.
export function buildLocalBusinessJsonLd({ business, address, siteConfig }) {
  const { reviews } = siteConfig;
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description,
    url: baseUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
    },
  };

  // Use the first review platform (typically the most prominent, e.g. Google) as the
  // representative aggregate rating — schema.org only supports one aggregateRating per entity.
  const primaryReview = reviews?.platforms?.[0];
  if (primaryReview) {
    const reviewCount = parseInt(primaryReview.count, 10);
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: primaryReview.rating,
      reviewCount: Number.isFinite(reviewCount) && reviewCount > 0 ? reviewCount : 1,
    };
  }

  return data;
}
