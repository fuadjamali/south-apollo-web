import siteConfig from "@/config/site";
import { getPosts } from "@/lib/blog";
import { getProducts } from "@/lib/products";
import { getItems } from "@/lib/newsEvents";

export default async function sitemap() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const entries = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];

  entries.push({
    url: `${baseUrl}/membership`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.4,
  });

  const products = await getProducts();
  for (const product of products) {
    entries.push({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  if (siteConfig.blog) {
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

  if (siteConfig.newsEvents) {
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
