"use client";

import Logo from "@/components/Logo";
import { useCart } from "@/components/CartContext";
import { formatCurrency } from "@/lib/currency";
import siteConfig from "@/config/site";

export default function CartPage() {
  const { items, hydrated, updateQuantity, removeItem, subtotal } = useCart();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 text-xl font-bold">
            <Logo className="h-7 w-7" />
            {siteConfig.business.name}
          </a>
          <a href="/" className="text-sm font-medium hover:text-muted">
            &larr; Continue shopping
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold">Your cart</h1>

        {!hydrated ? null : items.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-muted">Your cart is empty.</p>
            <a
              href="/#products"
              className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Browse products
            </a>
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 rounded-xl border border-border p-4"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted">{formatCurrency(item.unitPrice)} each</p>
                  </div>

                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.productId, parseInt(e.target.value, 10) || 1)
                    }
                    className="w-16 rounded-lg border border-border bg-surface px-2 py-1.5 text-center text-sm focus:border-accent focus:outline-none"
                  />

                  <p className="w-20 text-right font-semibold">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    className="text-sm text-red-600 hover:underline dark:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <p className="text-lg font-semibold">Subtotal</p>
              <p className="text-lg font-bold">{formatCurrency(subtotal)}</p>
            </div>

            <a
              href="/checkout"
              className="mt-6 block w-full rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Proceed to checkout
            </a>
          </>
        )}
      </main>
    </div>
  );
}
