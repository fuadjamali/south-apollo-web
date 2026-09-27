import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct } from "@/lib/products";
import { getProductPhotos } from "@/lib/productPhotos";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { isModuleEnabled } from "@/lib/plan";
import { getBusinessInfo } from "@/lib/businessInfo";
import { buildPageMetadata } from "@/lib/seo";
import { getT } from "@/lib/i18n/server";
import { getSiteHeaderProps } from "@/lib/siteHeader";
import { buildProductJsonLd } from "@/lib/structuredData";

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return {};
  return buildPageMetadata({
    title: product.name,
    description: product.description,
    path: `/products/${product.id}`,
    image: product.image,
  });
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const { locale, t } = await getT();
  const [product, cartEnabled, business, photos, headerProps] = await Promise.all([
    getProduct(id),
    isModuleEnabled("cart"),
    getBusinessInfo(),
    getProductPhotos(id),
    getSiteHeaderProps(locale),
  ]);

  if (!product) {
    notFound();
  }

  // Falls back to the single legacy `image` column for products that predate the photo
  // gallery (no product_photos rows yet), so they still render exactly as before.
  const galleryPhotos = photos.length > 0 ? photos : product.image ? [{ image: product.image }] : [];
  const jsonLd = buildProductJsonLd({ product, business });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader {...headerProps} />

      <main className="mx-auto max-w-4xl px-6 py-16">
        <Link href="/" className="text-sm font-medium text-accent hover:underline">
          &larr; {t("products.backTo", { name: business.name })}
        </Link>
        <div className="mt-6 grid gap-10 sm:grid-cols-2">
          <div>
            <ProductGallery key={product.id} photos={galleryPhotos} productName={product.name} />
          </div>

          <div>
            {product.category && (
              <span className="inline-block rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
                {product.category}
              </span>
            )}
            <h1 className={`text-3xl font-bold ${product.category ? "mt-3" : ""}`}>{product.name}</h1>
            {product.price && (
              <p className="mt-3 text-2xl font-bold text-primary">{product.price}</p>
            )}
            {product.description && (
              <p className="mt-6 whitespace-pre-line text-muted">{product.description}</p>
            )}

            {product.price_amount != null && cartEnabled ? (
              <AddToCartButton product={product} />
            ) : (
              <a
                href="/#enquiry"
                className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                {t("products.enquire")}
              </a>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
