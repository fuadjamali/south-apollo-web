import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import siteConfig from "@/config/site";

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <a href="/" className="text-sm font-medium hover:text-muted">
            &larr; Back to {siteConfig.business.name}
          </a>
          {product.category && (
            <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
              {product.category}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 sm:aspect-square">
            {product.image && (
              // Admin-editable image source — plain <img>, same reasoning as the home page grid.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {product.price && (
              <p className="mt-3 text-2xl font-bold text-primary">{product.price}</p>
            )}
            {product.description && (
              <p className="mt-6 whitespace-pre-line text-muted">{product.description}</p>
            )}

            <a
              href="/#enquiry"
              className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Enquire about this
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
