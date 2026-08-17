import { notFound } from "next/navigation";
import Logo from "@/components/Logo";
import { getOrderByNumber } from "@/lib/orders";
import { formatCurrency } from "@/lib/currency";
import siteConfig from "@/config/site";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({ params }) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 whitespace-nowrap text-xl font-bold">
            <Logo className="h-7 w-7" />
            {siteConfig.business.name}
          </a>
          <a href="/" className="text-sm font-medium hover:text-muted">
            &larr; Back to home
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold">Thanks, {order.customer_name.split(" ")[0]}!</h1>
        <p className="mt-2 text-muted">
          Your order <span className="font-semibold text-foreground">{order.order_number}</span>{" "}
          has been placed. We&apos;ll be in touch at {order.customer_email} to arrange payment and
          delivery.
        </p>

        <div className="mt-8 rounded-xl border border-border p-6 text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">Order items</p>
          <div className="mt-3 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <span>{formatCurrency(item.line_total)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t border-border pt-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <span>Discount ({order.discount_code})</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.subtotal - order.discount_amount)}</span>
            </div>
          </div>
        </div>

        <a
          href="/"
          className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          Continue browsing
        </a>
      </main>
    </div>
  );
}
