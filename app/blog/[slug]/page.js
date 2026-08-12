import Image from "next/image";
import { notFound } from "next/navigation";
import siteConfig from "@/config/site";

export function generateStaticParams() {
  return (siteConfig.blog?.posts ?? []).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = siteConfig.blog?.posts.find((p) => p.slug === slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = siteConfig.blog?.posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <a href="/blog" className="text-sm text-accent hover:underline">
        &larr; Back to blog
      </a>

      <p className="mt-6 text-xs text-muted">
        {new Date(post.date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <h1 className="mt-1 text-3xl font-bold">{post.title}</h1>

      <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
        <Image src={post.image} alt={post.title} fill sizes="100vw" className="object-cover" />
      </div>

      <div className="mt-8 space-y-4 text-foreground">
        {post.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
