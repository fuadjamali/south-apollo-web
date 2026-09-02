import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { getProductPhotos } from "@/lib/productPhotos";
import DetailField from "@/components/DetailField";
import { formatCurrency } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function AdminProductDetailPage({ params }) {
  const { id } = await params;
  const [product, photos] = await Promise.all([getProduct(id), getProductPhotos(id)]);

  if (!product) {
    notFound();
  }

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">{product.name}</h1>
          <div className="flex gap-2">
            <a
              href={`/admin/products/${product.id}/edit`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              Edit
            </a>
            <a
              href="/admin/products"
              className="self-center text-sm font-medium text-muted hover:underline"
            >
              &larr; Back to products
            </a>
          </div>
        </div>

        {photos.length > 0 ? (
          <div className="mt-6">
            <p className="text-xs font-medium text-muted">
              {photos.length} photo{photos.length === 1 ? "" : "s"}
            </p>
            <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.image}
                    alt=""
                    className="h-24 w-full rounded-lg border border-border object-cover"
                  />
                  {photo.is_cover && (
                    <span className="absolute left-1 top-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          product.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt=""
              className="mt-6 h-48 w-full rounded-lg border border-border object-cover"
            />
          )
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailField label="Price label" value={product.price} />
          <DetailField
            label="Cart price"
            value={product.price_amount != null ? formatCurrency(product.price_amount) : null}
          />
          <DetailField label="Category" value={product.category} />
          <DetailField label="Display order" value={product.display_order} />
        </div>
        <DetailField label="Description" value={product.description} className="mt-4" />

        <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
          Added {new Date(product.created_at).toLocaleString()} · Updated{" "}
          {new Date(product.updated_at).toLocaleString()}
        </p>

        <a
          href={`/products/${product.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-accent hover:underline"
        >
          View on site &rarr;
        </a>
      </div>
    </div>
  );
}
