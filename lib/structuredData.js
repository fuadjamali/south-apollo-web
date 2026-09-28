// `business` is a business_info row (lib/businessInfo.js — name, description, ...); `address`
// is contact_info.address (lib/contactInfo.js) — the same value shown in the Contact Us
// section and the map embed, rather than a separate copy of its own.
export function buildLocalBusinessJsonLd({ business, address, telephone, siteConfig }) {
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
  if (telephone) data.telephone = telephone;

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

// Google's "Article" rich-result card. `image` is one of the fields Google's own Article
// guidelines recommend but don't strictly require — omitted (not a broken empty string) on a
// post with no image, same as buildProductJsonLd does for a product with no photo.
export function buildArticleJsonLd({ post, business, url }) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.image ? [post.image] : undefined,
    datePublished: post.published_date,
    dateModified: post.updated_at || post.published_date,
    author: { "@type": "Organization", name: business.name },
    publisher: { "@type": "Organization", name: business.name },
    mainEntityOfPage: url || `${baseUrl}/blog/${post.slug}`,
  };
}

// A product's price/availability in search results (Google's "Product" rich result). `price`
// should be the raw numeric amount (lib/products.js's price_amount, not the free-text `price`
// label) — omitted entirely when there's no numeric price, since `offers` without one isn't
// valid schema and products here don't all have cart pricing set.
export function buildProductJsonLd({ product, business, url }) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.image ? [product.image] : undefined,
    brand: { "@type": "Brand", name: business.name },
  };

  if (product.price_amount != null) {
    data.offers = {
      "@type": "Offer",
      price: product.price_amount,
      // Matches lib/currency.js's formatCurrency — the actual currency cart/checkout charges in,
      // not necessarily whatever symbol admin-entered `price` label text happens to show (that's
      // a free-text display field, unrelated to price_amount's real currency).
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: url || `${baseUrl}/products/${product.id}`,
    };
  }

  return data;
}
