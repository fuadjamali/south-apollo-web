import siteConfig from "@/config/site";

export default function sitemap() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const entries = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];

  if (siteConfig.blog) {
    entries.push({
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    for (const post of siteConfig.blog.posts) {
      entries.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
