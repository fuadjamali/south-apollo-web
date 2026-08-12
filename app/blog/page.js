import Image from "next/image";
import siteConfig from "@/config/site";

export const metadata = {
  title: "Blog",
  description: siteConfig.blog?.subheading,
};

export default function BlogIndexPage() {
  const { blog } = siteConfig;

  if (!blog) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="mt-2 text-muted">No posts yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">{blog.heading}</h1>
      <p className="mt-2 text-muted">{blog.subheading}</p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {blog.posts.map((post) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="overflow-hidden rounded-xl border border-border shadow-sm transition hover:shadow-md"
          >
            <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <p className="text-xs text-muted">
                {new Date(post.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h2 className="mt-1 text-lg font-semibold">{post.title}</h2>
              <p className="mt-1 text-sm text-muted">{post.excerpt}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
