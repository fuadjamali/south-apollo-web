import AIAssistantButton from "@/components/AIAssistantButton";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function ProductForm({ action, product, submitLabel, aiEnabled = false }) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground">Name</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={product?.name}
          placeholder="Product name"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Description</label>
        <textarea
          id="product-description"
          name="description"
          rows={3}
          defaultValue={product?.description}
          placeholder="Short description"
          className={fieldClass}
        />
        {aiEnabled && (
          <AIAssistantButton targetId="product-description" fieldLabel="product description" />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Price label</label>
          <input
            type="text"
            name="price"
            defaultValue={product?.price}
            placeholder="$29"
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-muted">
            Shown on the site. Can be free text, e.g. &quot;From $29&quot; or &quot;Contact for
            quote&quot;.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Category</label>
          <input
            type="text"
            name="category"
            defaultValue={product?.category}
            placeholder="e.g. General"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          Cart price (leave blank to disable &quot;Add to cart&quot; for this product)
        </label>
        <input
          type="number"
          name="priceAmount"
          step="0.01"
          min="0"
          defaultValue={product?.price_amount ?? ""}
          placeholder="29.00"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Display order</label>
        <input
          type="number"
          name="displayOrder"
          defaultValue={product?.display_order ?? 0}
          className={fieldClass}
        />
      </div>

      {!product && (
        <p className="text-xs text-muted">
          Photos are added after the product is created — you&apos;ll be taken to the photo
          manager next.
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          {submitLabel}
        </button>
        <a
          href="/admin/products"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
