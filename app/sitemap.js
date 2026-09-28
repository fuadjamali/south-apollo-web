import { getPosts } from "@/lib/blog";
import { getProducts } from "@/lib/products";
import { getItems } from "@/lib/newsEvents";
import { getPhotos } from "@/lib/gallery";
import { getModuleStates, isEnabled } from "@/lib/plan";
import { getAllLegalPages } from "@/lib/legalPages";

export default async function sitemap() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const [moduleStates, legalPages] = await Promise.all([getModuleStates(), getAllLegalPages()]);

  const entries = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];

  if (isEnabled("booking", moduleStates)) {
    entries.push({
      url: `${baseUrl}/booking`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  if (isEnabled("reviews", moduleStates)) {
    entries.push({
      url: `${baseUrl}/leave-a-review`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    });
  }

  // Only the ones an admin has actually filled in and switched on — LegalPageView itself
  // refuses to render an unfilled one, so listing it in the sitemap would just 404 a crawler.
  for (const page of legalPages) {
    if (!page.enabled) continue;
    entries.push({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.updated_at),
      changeFrequency: "yearly",
      priority: 0.3,
    });
  }

  const products = isEnabled("products", moduleStates) ? await getProducts() : [];
  for (const product of products) {
    entries.push({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  if (isEnabled("blog", moduleStates)) {
    entries.push({
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    const posts = await getPosts();
    for (const post of posts) {
      entries.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.published_date),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  if (isEnabled("team", moduleStates)) {
    entries.push({
      url: `${baseUrl}/team`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  if (isEnabled("healthPackages", moduleStates)) {
    entries.push({
      url: `${baseUrl}/health-checkup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  if (isEnabled("doctors", moduleStates)) {
    entries.push({
      url: `${baseUrl}/doctors`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  if (isEnabled("gallery", moduleStates)) {
    const photos = await getPhotos();
    entries.push({
      url: `${baseUrl}/gallery`,
      lastModified: photos[0] ? new Date(photos[0].created_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  if (isEnabled("newsEvents", moduleStates)) {
    entries.push({
      url: `${baseUrl}/news-events`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    const items = await getItems();
    for (const item of items) {
      entries.push({
        url: `${baseUrl}/news-events/${item.slug}`,
        lastModified: new Date(item.published_date),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
