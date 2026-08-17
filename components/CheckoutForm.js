"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { formatCurrency } from "@/lib/currency";
import { placeOrderAction } from "@/app/checkout/actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function CheckoutForm({ member }) {
  const router = useRouter();
  const { items, hydrated, subtotal, clearCart } = useCart();
  const [state, formAction, pending] = useActionState(placeOrderAction, {});

  useEffect(() => {
    if (state?.success && state?.orderNumber) {
      clearCart();
      router.push(`/order-confirmation/${state.orderNumber}`);
    }
    // clearCart/router are stable across renders; only re-run when the order actually succeeds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!hydrated) return null;

  if (items.length === 0 && !state?.success) {
    return (
      <div className="mt-10 text-center">
        <p className="text-muted">Your cart is empty.</p>
        <a
          href="/#products"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          Browse products
        </a>
      </div>
    );
  }

  return (
    <>
      {member ? (
        <p className="mt-6 rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm text-foreground">
          Checking out as <span className="font-semibold">{member.name}</span> ({member.email}).
          This order will be saved to{" "}
          <a href="/member/orders" className="underline">
            your account
          </a>
          .
        </p>
      ) : (
        <p className="mt-6 rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm text-muted">
          Checking out as a guest.{" "}
          <a
            href="/member/login?redirect=/checkout"
            className="font-medium text-accent hover:underline"
          >
            Log in
          </a>{" "}
          to save this order to your account, or continue below.
        </p>
      )}

      <div className="mt-4 rounded-xl border border-border p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">Order summary</p>
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
      </div>

      <form action={formAction} className="mt-8 space-y-4">
        <input type="hidden" name="cart" value={JSON.stringify(items)} />

        <div>
          <label className="block text-sm font-medium text-foreground">Full name</label>
          <input
            type="text"
            name="customerName"
            required
            defaultValue={member?.name}
            className={fieldClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            name="customerEmail"
            required
            defaultValue={member?.email}
            className={fieldClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">Phone (optional)</label>
          <input type="tel" name="customerPhone" className={fieldClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            Delivery address (optional)
          </label>
          <textarea name="customerAddress" rows={2} className={fieldClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">Notes (optional)</label>
          <textarea name="notes" rows={2} className={fieldClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            Discount code (optional)
          </label>
          <input
            type="text"
            name="discountCode"
            placeholder="e.g. WELCOME10"
            className={fieldClass}
          />
        </div>

        {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Placing order..." : "Place order"}
        </button>
      </form>
    </>
  );
}
